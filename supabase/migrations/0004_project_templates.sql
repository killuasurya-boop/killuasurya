-- 0004 — Project templates + client materials ("bahan dari klien").
-- The working-day clock of a templated project starts only when every REQUIRED material is received
-- (or the Owner chose its "Rencana B"). Run after 0001–0003. Additive only: no existing data is changed.

alter table public.projects
  add column if not exists template text check (template is null or char_length(template) <= 40),
  add column if not exists materials_due date,
  add column if not exists start_date date;
alter table public.tasks add column if not exists day_offset smallint check (day_offset between 0 and 60);

create type public.material_status as enum ('missing', 'sent', 'received', 'fallback');
create table public.project_materials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  position smallint not null default 0,
  label text not null check (char_length(label) between 2 and 160),
  detail text not null default '' check (char_length(detail) <= 400),
  fallback text check (fallback is null or char_length(fallback) <= 400),
  required boolean not null default true,
  status public.material_status not null default 'missing',
  note text not null default '' check (char_length(note) <= 500),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
create index project_materials_project on public.project_materials (project_id, position);
alter table public.project_materials enable row level security;

create policy materials_read on public.project_materials for select to authenticated using (
  public.is_staff() or exists (select 1 from public.projects p where p.id = project_id and p.client_id in (select public.my_client_ids())));
create policy materials_insert on public.project_materials for insert to authenticated with check (public.is_owner());
create policy materials_update on public.project_materials for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy materials_delete on public.project_materials for delete to authenticated using (public.is_owner());

-- Staff may only mark received / missing; only the Owner edits items or chooses Rencana B.
create function public.guard_material() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'fallback' and new.fallback is null then raise exception 'Bahan ini tidak punya Rencana B'; end if;
  if auth.uid() is not null and not public.is_owner() and coalesce(current_setting('app.material', true), '') <> '1' then
    if new.label <> old.label or new.detail <> old.detail or new.required <> old.required
       or new.fallback is distinct from old.fallback or new.project_id <> old.project_id then
      raise exception 'Hanya Owner yang dapat mengubah daftar bahan';
    end if;
    if new.status = 'fallback' and old.status <> 'fallback' then raise exception 'Hanya Owner yang memutuskan Rencana B'; end if;
  end if;
  new.updated_at := now(); new.updated_by := auth.uid();
  return new;
end $$;
create trigger project_materials_guard before update on public.project_materials for each row execute function public.guard_material();

-- Client: "Sudah saya kirim" (+ optional note, e.g. a Google Drive link). Only for their own project, only from 'missing'.
create function public.material_mark_sent(p_id uuid, p_note text default '') returns void
language plpgsql security definer set search_path = public as $$
declare m public.project_materials;
begin
  select * into m from public.project_materials where id = p_id;
  if m.id is null or not exists (select 1 from public.projects p where p.id = m.project_id and p.client_id in (select public.my_client_ids())) then
    raise exception 'Tidak diizinkan';
  end if;
  if m.status <> 'missing' then raise exception 'Bahan ini sudah tercatat'; end if;
  perform set_config('app.material', '1', true);
  update public.project_materials set status = 'sent', note = left(coalesce(p_note, ''), 500) where id = p_id;
  insert into public.audit_log (actor, action, entity, entity_id, detail) values (auth.uid(), 'material.sent', 'project_materials', p_id::text, jsonb_build_object('project', m.project_id));
end $$;
revoke all on function public.material_mark_sent(uuid, text) from public, anon;
grant execute on function public.material_mark_sent(uuid, text) to authenticated;

create function public.add_workdays(d date, n int) returns date language plpgsql immutable as $$
declare r date := d; k int := 0;
begin
  while extract(isodow from r) > 5 loop r := r + 1; end loop;
  while k < n loop r := r + 1; if extract(isodow from r) <= 5 then k := k + 1; end if; end loop;
  return r;
end $$;

-- Owner starts the clock: sets every templated task's deadline from its working day and opens day-1 tasks.
create function public.project_start(p_project uuid, p_start date) returns date
language plpgsql security definer set search_path = public as $$
declare pr public.projects; first date; fb text;
begin
  if not public.is_owner() then raise exception 'Hanya Owner'; end if;
  select * into pr from public.projects where id = p_project;
  if pr.id is null then raise exception 'Proyek tidak ditemukan'; end if;
  if pr.start_date is not null then raise exception 'Proyek sudah berjalan'; end if;
  if p_start is null or p_start < (now() at time zone 'Asia/Jakarta')::date - 7 then raise exception 'Tanggal mulai tidak valid'; end if;
  if exists (select 1 from public.project_materials where project_id = p_project and required and status not in ('received', 'fallback')) then
    raise exception 'Masih ada bahan wajib yang belum lengkap';
  end if;
  first := public.add_workdays(p_start, 0);
  update public.projects set start_date = first where id = p_project;
  update public.tasks set due = public.add_workdays(first, day_offset), status = case when day_offset = 0 then 'ready'::public.task_status else 'waiting'::public.task_status end
    where project_id = p_project and day_offset is not null and status in ('draft', 'waiting');
  select string_agg(label, ', ' order by position) into fb from public.project_materials where project_id = p_project and status = 'fallback';
  if fb is not null then
    insert into public.tasks (project_id, title, description, stage, status, pic, due, priority)
    values (p_project, 'Ganti Rencana B dengan bahan asli', 'Sementara memakai Rencana B: ' || fb || '. Ganti begitu file asli dari klien masuk.', 'production', 'ready', auth.uid(), public.add_workdays(first, 2), 2);
  end if;
  insert into public.audit_log (actor, action, entity, entity_id, detail) values (auth.uid(), 'project.start', 'projects', p_project::text, jsonb_build_object('start', first));
  return first;
end $$;
revoke all on function public.project_start(uuid, date) from public, anon;
grant execute on function public.project_start(uuid, date) to authenticated;
