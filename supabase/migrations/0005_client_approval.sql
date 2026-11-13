-- 0005 — Client approval in the portal + "Selesai" for template sub-tasks. Run after 0004. Additive.
-- Owner sends a task to the client with a preview link (stage 'client'); the client approves (→ Scheduling, publisher)
-- or asks for a revision with a note (→ Revision, Editing). Each revision round is counted.

alter table public.tasks
  add column if not exists needs_client boolean not null default false,
  add column if not exists preview_url text check (preview_url is null or preview_url ~ '^https?://'),
  add column if not exists client_feedback text check (client_feedback is null or char_length(client_feedback) <= 2000),
  add column if not exists client_rounds smallint not null default 0,
  add column if not exists client_sent_by uuid references public.profiles (id) on delete set null;

create or replace function public.task_transition(p_task uuid, p_action text, p_text text default null) returns public.tasks
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
      if t.status <> 'review' or t.stage = 'client' then raise exception 'Tidak ada yang menunggu approval Owner'; end if;
      update public.tasks set status = 'ready', stage = 'scheduling', pic = coalesce(public.default_assignee('scheduling'), t.pic) where id = p_task;
    when 'revise' then
      if not owner then raise exception 'Hanya Owner yang dapat meminta revisi'; end if;
      if t.status <> 'review' or t.stage = 'client' then raise exception 'Tidak ada yang menunggu approval Owner'; end if;
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
    when 'finish' then
      -- template sub-task (no approval of its own): the PIC closes it; tasks that need the client go through send_client
      if t.day_offset is null or t.needs_client or t.status <> 'progress' or t.stage not in ('planning', 'prep', 'production', 'editing') then
        raise exception 'Tugas ini tidak bisa langsung diselesaikan';
      end if;
      update public.tasks set status = 'completed' where id = p_task;
    when 'send_client' then
      if not owner then raise exception 'Hanya Owner yang dapat mengirim ke klien'; end if;
      if t.status not in ('progress', 'review') or t.stage in ('client', 'scheduling', 'publishing', 'reporting') then raise exception 'Tugas belum bisa dikirim ke klien'; end if;
      if coalesce(p_text, '') !~ '^https?://\S+\.\S+' then raise exception 'Link pratinjau wajib diisi'; end if;
      update public.tasks set status = 'review', stage = 'client', preview_url = p_text, client_sent_by = me where id = p_task;
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

create function public.client_decide(p_task uuid, p_decision text, p_text text default null) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tasks; note text := left(trim(coalesce(p_text, '')), 2000);
begin
  select * into t from public.tasks where id = p_task for update;
  if t.id is null or not exists (select 1 from public.projects p where p.id = t.project_id and p.client_id in (select public.my_client_ids())) then
    raise exception 'Tidak diizinkan';
  end if;
  if t.stage <> 'client' or t.status <> 'review' then raise exception 'Tidak ada yang menunggu persetujuan Anda'; end if;
  perform set_config('app.transition', '1', true);
  if p_decision = 'approve' then
    update public.tasks set status = 'ready', stage = 'scheduling', pic = coalesce(public.default_assignee('scheduling'), t.client_sent_by, t.pic),
      client_feedback = nullif(note, '') where id = p_task;
  elsif p_decision = 'revise' then
    if char_length(note) < 5 then raise exception 'Tuliskan bagian yang perlu direvisi'; end if;
    update public.tasks set status = 'revision', stage = 'editing', pic = coalesce(public.default_assignee('editing'), t.client_sent_by, t.pic),
      client_feedback = note, client_rounds = t.client_rounds + 1 where id = p_task;
  else raise exception 'Keputusan tidak dikenal';
  end if;
  perform set_config('app.transition', '', true);
  insert into public.audit_log (actor, action, entity, entity_id, detail)
  values (auth.uid(), 'client.' || p_decision, 'tasks', p_task::text, jsonb_build_object('round', t.client_rounds + case when p_decision = 'revise' then 1 else 0 end));
end $$;
revoke all on function public.client_decide(uuid, text, text) from public, anon;
grant execute on function public.client_decide(uuid, text, text) to authenticated;
