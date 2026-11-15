-- Existing JWTs remain valid after a profile is deactivated. Enforce active status in
-- the database as well as middleware, including SECURITY DEFINER membership lookups.
create or replace function public.my_client_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select m.client_id from public.client_members m
  join public.profiles p on p.id = m.user_id
  where m.user_id = auth.uid() and p.active
$$;

-- Restrictive policies are ANDed with existing per-role / per-project policies.
-- They never grant new access. Definer helpers still read profiles without recursion.
do $$
declare t text;
begin
  foreach t in array array['profiles', 'clients', 'client_members', 'leads', 'quotations',
    'projects', 'tasks', 'task_checklist', 'task_comments', 'task_files', 'task_history',
    'audit_log', 'project_materials', 'project_files']
  loop
    execute format('create policy active_account on public.%I as restrictive for all to authenticated
      using ((select public.my_role()) is not null)
      with check ((select public.my_role()) is not null)', t);
  end loop;
end $$;

-- A client assigned as PIC must not acquire staff write privileges.
alter policy tasks_update on public.tasks
  using (public.is_owner() or (public.is_staff() and pic = auth.uid()))
  with check (public.is_owner() or (public.is_staff() and pic = auth.uid()));
alter policy checklist_write on public.task_checklist
  using (public.is_staff() and exists (select 1 from public.tasks t where t.id = task_id and (public.is_owner() or t.pic = auth.uid())))
  with check (public.is_staff() and exists (select 1 from public.tasks t where t.id = task_id and (public.is_owner() or t.pic = auth.uid())));

create policy active_project_files on storage.objects as restrictive for all to authenticated
  using (bucket_id <> 'project-files' or (select public.my_role()) is not null)
  with check (bucket_id <> 'project-files' or (select public.my_role()) is not null);

-- These tables were added after the original blanket grant in 0001. Explicit grants
-- are required on projects where new tables are no longer exposed automatically.
grant select, insert, update, delete on public.project_materials to authenticated;
grant select, insert, delete on public.project_files to authenticated;
