-- One RPC is one PostgreSQL transaction: failures roll back the client/project,
-- materials, tasks and checklists together. Invoker functions retain existing RLS.
create function public.create_task_with_checklist(
  p_project uuid, p_new_client text, p_new_project text, p_title text,
  p_description text, p_stage public.task_stage, p_pic uuid, p_due date,
  p_priority smallint, p_checklist jsonb
) returns uuid language plpgsql security invoker set search_path = public as $$
declare project_id uuid := p_project; task_id uuid;
begin
  if not public.is_owner() then raise exception 'Hanya Owner'; end if;
  if not exists (select 1 from public.profiles where id = p_pic and active and role <> 'client') then
    raise exception 'PIC harus staf aktif';
  end if;
  if jsonb_typeof(p_checklist) is distinct from 'array' then raise exception 'Checklist tidak valid'; end if;
  if jsonb_array_length(p_checklist) > 20 or exists (
    select 1 from jsonb_array_elements(p_checklist) x
    where jsonb_typeof(x) <> 'string' or char_length(trim(x #>> '{}')) not between 1 and 200
  ) then raise exception 'Checklist tidak valid'; end if;
  if project_id is null then
    project_id := public.create_project(p_new_client, p_new_project);
  end if;
  insert into public.tasks (project_id, title, description, stage, status, pic, due, priority)
  values (project_id, trim(p_title), coalesce(p_description, ''), p_stage, 'ready', p_pic, p_due, p_priority)
  returning id into task_id;
  insert into public.task_checklist (task_id, text, position)
  select task_id, trim(x.value #>> '{}'), (x.ordinality - 1)::smallint
  from jsonb_array_elements(p_checklist) with ordinality x;
  return task_id;
end $$;
revoke all on function public.create_task_with_checklist(uuid, text, text, text, text, public.task_stage, uuid, date, smallint, jsonb) from public, anon;
grant execute on function public.create_task_with_checklist(uuid, text, text, text, text, public.task_stage, uuid, date, smallint, jsonb) to authenticated;

create function public.create_project_with_template(
  p_client text, p_project text, p_template text, p_materials_due date,
  p_materials jsonb, p_plan jsonb
) returns uuid language plpgsql security invoker set search_path = public as $$
declare project_id uuid; task_id uuid; assignee uuid; m jsonb; t jsonb; pos integer := 0;
begin
  if not public.is_owner() then raise exception 'Hanya Owner'; end if;
  if char_length(coalesce(trim(p_template), '')) not between 1 and 40
    or jsonb_typeof(p_materials) is distinct from 'array'
    or jsonb_typeof(p_plan) is distinct from 'array' then raise exception 'Template tidak valid'; end if;
  if jsonb_array_length(p_materials) > 30 or jsonb_array_length(p_plan) not between 1 and 30 then
    raise exception 'Template tidak valid';
  end if;
  project_id := public.create_project(p_client, p_project);
  update public.projects set template = trim(p_template), materials_due = p_materials_due where id = project_id;
  for m in select value from jsonb_array_elements(p_materials) loop
    if jsonb_typeof(m) <> 'object' then raise exception 'Bahan tidak valid'; end if;
    insert into public.project_materials (project_id, position, label, detail, fallback, required)
    values (project_id, pos, m ->> 'label', coalesce(m ->> 'detail', ''), nullif(m ->> 'fallback', ''), coalesce((m ->> 'required')::boolean, true));
    pos := pos + 1;
  end loop;
  for t in select value from jsonb_array_elements(p_plan) loop
    if jsonb_typeof(t) <> 'object' or coalesce(t ->> 'role', '') not in ('owner', 'planner', 'production', 'editor', 'publisher')
      or jsonb_typeof(t -> 'day') is distinct from 'number'
      or (t ->> 'day')::integer not between 1 and 61
      or jsonb_typeof(t -> 'checklist') is distinct from 'array' then raise exception 'Rencana tugas tidak valid'; end if;
    if jsonb_array_length(t -> 'checklist') > 20 or exists (
      select 1 from jsonb_array_elements(t -> 'checklist') x
      where jsonb_typeof(x) <> 'string' or char_length(trim(x #>> '{}')) not between 1 and 200
    ) then raise exception 'Checklist tidak valid'; end if;
    select id into assignee from public.profiles where active and role = (t ->> 'role')::public.app_role order by created_at, id limit 1;
    insert into public.tasks (project_id, title, stage, status, pic, day_offset, needs_client, priority)
    values (project_id, t ->> 'title', (t ->> 'stage')::public.task_stage, 'waiting', coalesce(assignee, auth.uid()),
      (t ->> 'day')::integer - 1, coalesce((t ->> 'client')::boolean, false), 2)
    returning id into task_id;
    insert into public.task_checklist (task_id, text, position)
    select task_id, trim(x.value #>> '{}'), (x.ordinality - 1)::smallint
    from jsonb_array_elements(t -> 'checklist') with ordinality x;
  end loop;
  return project_id;
end $$;
revoke all on function public.create_project_with_template(text, text, text, date, jsonb, jsonb) from public, anon;
grant execute on function public.create_project_with_template(text, text, text, date, jsonb, jsonb) to authenticated;
