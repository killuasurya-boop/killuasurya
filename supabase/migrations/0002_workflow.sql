-- Workflow transitions (Master Prompt V5 §3). All stage hand-offs go through task_transition(), which
-- validates WHO may do WHAT on the server. Direct updates by a non-owner PIC stay limited by tasks_guard.

-- Default assignee for a stage = first active profile with the matching role (Owner can reassign any task).
create function public.default_assignee(s public.task_stage) returns uuid language sql stable security definer set search_path = public as $$
  select id from public.profiles
  where active and role = (case s
    when 'planning' then 'planner' when 'production' then 'planner' when 'prep' then 'production'
    when 'editing' then 'editor' when 'scheduling' then 'publisher' when 'publishing' then 'publisher'
    else 'owner' end)::public.app_role
  order by created_at limit 1
$$;

create or replace function public.guard_task_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;            -- service role / SQL editor
  -- `app.transition` is set only inside task_transition() (transaction-local); clients cannot set it.
  if not public.is_owner() and coalesce(current_setting('app.transition', true), '') <> '1' then
    if old.pic is distinct from auth.uid() then raise exception 'Hanya PIC atau Owner yang dapat mengubah tugas ini'; end if;
    if new.pic is distinct from old.pic then raise exception 'Hanya Owner yang dapat mengubah PIC'; end if;
    if new.project_id <> old.project_id then raise exception 'Proyek tidak dapat diubah'; end if;
    if new.status is distinct from old.status or new.stage is distinct from old.stage or new.published_url is distinct from old.published_url then
      raise exception 'Gunakan aksi alur kerja untuk mengubah status';
    end if;
  end if;
  if new.status = 'completed' and old.status <> 'completed' then new.completed_at := now(); end if;
  if new.status is distinct from old.status or new.stage is distinct from old.stage or new.pic is distinct from old.pic then
    insert into public.task_history (task_id, actor, entry)
    values (new.id, auth.uid(), format('%s/%s → %s/%s', old.stage, old.status, new.stage, new.status)
      || case when new.pic is distinct from old.pic then ' · PIC diubah' else '' end
      || case when new.blocker is not null and new.status = 'blocked' then ' · ' || new.blocker else '' end);
    insert into public.audit_log (actor, action, entity, entity_id, detail)
    values (auth.uid(), 'task.update', 'tasks', new.id::text, jsonb_build_object('from', old.status, 'to', new.status, 'stage', new.stage));
  end if;
  return new;
end $$;

create function public.task_transition(p_task uuid, p_action text, p_text text default null) returns public.tasks
language plpgsql security definer set search_path = public as $$
declare
  t public.tasks;
  me uuid := auth.uid();
  owner boolean := public.is_owner();
begin
  if me is null or not public.is_staff() then raise exception 'Tidak diizinkan'; end if;
  select * into t from public.tasks where id = p_task for update;
  if not found then raise exception 'Tugas tidak ditemukan'; end if;
  if not owner and t.pic is distinct from me then raise exception 'Hanya PIC atau Owner yang dapat mengubah tugas ini'; end if;
  perform set_config('app.transition', '1', true);

  case p_action
    when 'start' then
      if t.status not in ('draft', 'waiting', 'ready', 'revision') then raise exception 'Tugas tidak dapat dimulai dari status ini'; end if;
      update public.tasks set status = 'progress' where id = p_task;
    when 'submit' then
      if t.status <> 'progress' or t.stage in ('scheduling', 'publishing', 'reporting', 'owner') then raise exception 'Tugas belum bisa dikirim untuk approval'; end if;
      update public.tasks set status = 'review', stage = 'owner', pic = coalesce(public.default_assignee('owner'), t.pic) where id = p_task;
    when 'approve' then
      if not owner then raise exception 'Hanya Owner yang dapat menyetujui'; end if;
      if t.status <> 'review' then raise exception 'Tidak ada yang menunggu approval'; end if;
      update public.tasks set status = 'ready', stage = 'scheduling', pic = coalesce(public.default_assignee('scheduling'), t.pic) where id = p_task;
    when 'revise' then
      if not owner then raise exception 'Hanya Owner yang dapat meminta revisi'; end if;
      if t.status <> 'review' then raise exception 'Tidak ada yang menunggu approval'; end if;
      update public.tasks set status = 'revision', stage = 'editing', pic = coalesce(public.default_assignee('editing'), t.pic) where id = p_task;
    when 'schedule' then
      if t.stage <> 'scheduling' or t.status <> 'progress' then raise exception 'Tugas belum bisa dijadwalkan'; end if;
      update public.tasks set status = 'scheduled', stage = 'publishing' where id = p_task;
    when 'publish' then
      if t.status <> 'scheduled' then raise exception 'Tugas belum dijadwalkan'; end if;
      if coalesce(p_text, '') !~ '^https?://\S+\.\S+' then raise exception 'Tautan publikasi wajib diisi'; end if;
      update public.tasks set status = 'published', published_url = p_text where id = p_task;
    when 'block' then
      if t.status not in ('progress', 'ready') then raise exception 'Status ini tidak dapat ditandai Blocked'; end if;
      if char_length(coalesce(trim(p_text), '')) < 3 then raise exception 'Tulis alasan hambatan'; end if;
      update public.tasks set status = 'blocked', blocker = left(trim(p_text), 300) where id = p_task;
    when 'unblock' then
      if t.status <> 'blocked' then raise exception 'Tugas tidak sedang Blocked'; end if;
      update public.tasks set status = 'ready', blocker = null where id = p_task;
    when 'complete' then
      if not owner then raise exception 'Hanya Owner yang dapat menyelesaikan'; end if;
      if not (t.status = 'published' or (t.stage = 'reporting' and t.status = 'progress')) then raise exception 'Tugas belum bisa diselesaikan'; end if;
      update public.tasks set status = 'completed' where id = p_task;
    else raise exception 'Aksi tidak dikenal';
  end case;

  perform set_config('app.transition', '', true);
  select * into t from public.tasks where id = p_task;
  return t;
end $$;
revoke all on function public.task_transition(uuid, text, text) from public, anon;
grant execute on function public.task_transition(uuid, text, text) to authenticated;

-- Owner helper: create client + project in one step (used by "Tugas baru").
create function public.create_project(p_client text, p_project text) returns uuid language plpgsql security definer set search_path = public as $$
declare c uuid; p uuid;
begin
  if not public.is_owner() then raise exception 'Hanya Owner'; end if;
  if char_length(trim(p_client)) < 2 or char_length(trim(p_project)) < 2 then raise exception 'Nama klien dan proyek wajib diisi'; end if;
  select id into c from public.clients where lower(name) = lower(trim(p_client)) limit 1;
  if c is null then insert into public.clients (name) values (left(trim(p_client), 120)) returning id into c; end if;
  insert into public.projects (client_id, name) values (c, left(trim(p_project), 160)) returning id into p;
  return p;
end $$;
revoke all on function public.create_project(text, text) from public, anon;
grant execute on function public.create_project(text, text) to authenticated;

-- Lead follow-up fields the Owner edits from the CRM screen.
alter table public.leads add column if not exists follow_up date;
