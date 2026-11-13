-- 0006 — File upload for client materials (Supabase Storage, private bucket). Run after 0005. Additive.
-- Path layout: <project_id>/<random>-<name>. Storage access follows the same rules as the project:
-- staff see every project's files; a client only their own projects'. Only the Owner deletes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-files', 'project-files', false, 20971520, array[
  'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif', 'application/pdf', 'application/postscript', 'application/illustrator',
  'application/zip', 'application/x-zip-compressed', 'video/mp4', 'video/quicktime', 'text/plain',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do nothing;

create function public.can_see_project(p uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.is_staff() or exists (select 1 from public.projects x where x.id = p and x.client_id in (select public.my_client_ids()))
$$;

create policy project_files_read on storage.objects for select to authenticated
  using (bucket_id = 'project-files' and public.can_see_project(nullif(split_part(name, '/', 1), '')::uuid));
create policy project_files_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'project-files' and public.can_see_project(nullif(split_part(name, '/', 1), '')::uuid));
create policy project_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'project-files' and public.is_owner());

create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  material_id uuid references public.project_materials (id) on delete set null,
  path text not null unique check (split_part(path, '/', 1) = project_id::text),
  name text not null check (char_length(name) between 1 and 200),
  size integer not null check (size between 1 and 20971520),
  mime text not null default '',
  uploaded_by uuid not null default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index project_files_project on public.project_files (project_id, created_at);
alter table public.project_files enable row level security;
create policy files_meta_read on public.project_files for select to authenticated using (public.can_see_project(project_id));
create policy files_meta_insert on public.project_files for insert to authenticated with check (
  uploaded_by = auth.uid() and public.can_see_project(project_id)
  and (material_id is null or exists (select 1 from public.project_materials m where m.id = material_id and m.project_id = project_files.project_id)));
create policy files_meta_delete on public.project_files for delete to authenticated using (public.is_owner());

-- A file attached to a material moves it forward: client upload → "sent" (team checks it), staff upload → "received".
create function public.material_file_added() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.material_id is not null then
    perform set_config('app.material', '1', true);
    update public.project_materials set status = case when public.is_staff() then 'received'::public.material_status else 'sent'::public.material_status end
      where id = new.material_id and (status = 'missing' or (status = 'sent' and public.is_staff()));
    perform set_config('app.material', '', true);
  end if;
  insert into public.audit_log (actor, action, entity, entity_id, detail) values (auth.uid(), 'file.upload', 'project_files', new.id::text, jsonb_build_object('project', new.project_id, 'size', new.size));
  return new;
end $$;
create trigger project_files_added after insert on public.project_files for each row execute function public.material_file_added();
