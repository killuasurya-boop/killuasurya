-- Read-only diagnostics after applying all committed migrations. No business rows are exposed.
select count(*) as application_tables,
       count(*) filter (where c.relrowsecurity) as tables_with_rls,
       count(*) filter (where exists (
         select 1 from pg_policy p where p.polrelid = c.oid
         and p.polname = 'active_account' and not p.polpermissive
       )) as tables_with_active_account_guard
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r';

select p.proname, not p.prosecdef as uses_invoker_rights,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
and p.proname in ('create_task_with_checklist', 'create_project_with_template');

select id, public, file_size_limit from storage.buckets where id = 'project-files';

-- Expected: 14/14/14 application tables; two invoker RPCs executable by authenticated,
-- not anon; project-files is private with a 20971520-byte limit.
