-- KILLUASURYA.TECH — P0-B schema (Master Prompt V5 §3–§6, §9).
-- Run in the Supabase SQL editor (or `supabase db push`). Safe to run on a NEW project only.
-- Security model: every table has Row Level Security. Staff see work by role; clients see only their
-- own client's projects; the public (anon) can do exactly one thing: submit a lead with consent.

create type public.app_role as enum ('owner', 'planner', 'production', 'editor', 'publisher', 'client');
create type public.task_status as enum ('draft', 'waiting', 'ready', 'progress', 'review', 'revision', 'approved', 'scheduled', 'published', 'completed', 'blocked');
create type public.task_stage as enum ('planning', 'prep', 'production', 'editing', 'owner', 'client', 'scheduling', 'publishing', 'reporting');
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'consultation', 'proposal', 'negotiation', 'won', 'lost');
create type public.quote_status as enum ('draft', 'awaiting_owner', 'sent', 'accepted', 'revision', 'rejected');

-- ---------- identity ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role public.app_role not null default 'client',   -- new accounts start with the least privilege
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
create table public.client_members (
  client_id uuid not null references public.clients (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (client_id, user_id)
);

-- Helper functions run as definer so policies can read role/membership without recursive RLS.
create function public.my_role() returns public.app_role language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() and active $$;
create function public.is_owner() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(public.my_role() = 'owner', false) $$;
create function public.is_staff() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(public.my_role() in ('owner', 'planner', 'production', 'editor', 'publisher'), false) $$;
create function public.my_client_ids() returns setof uuid language sql stable security definer set search_path = public as
$$ select client_id from public.client_members where user_id = auth.uid() $$;

-- A profile row is created for every new auth user; the role can only be raised by the Owner.
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- CRM ----------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  contact text not null check (char_length(contact) between 5 and 160),
  business text not null default '' check (char_length(business) <= 200),
  services text[] not null default '{}',
  package_code text check (package_code is null or char_length(package_code) <= 20),
  needs text not null default '' check (char_length(needs) <= 4000),
  budget text not null default '' check (char_length(budget) <= 120),
  source text not null default 'website' check (char_length(source) <= 60),
  consent boolean not null,
  consent_at timestamptz not null default now(),
  status public.lead_status not null default 'new',
  notes text not null default '',
  created_at timestamptz not null default now(),
  constraint lead_requires_consent check (consent)
);

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  title text not null,
  items jsonb not null default '[]',
  total numeric(14, 2) not null default 0 check (total >= 0),
  status public.quote_status not null default 'draft',
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- projects & tasks ----------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  name text not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 200),
  description text not null default '',
  stage public.task_stage not null default 'planning',
  status public.task_status not null default 'draft',
  pic uuid references public.profiles (id) on delete set null,
  priority smallint not null default 2 check (priority between 1 and 3),
  due date,
  blocker text,
  published_url text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  -- "Published" is a fact, not an animation: it needs the recorded link.
  constraint published_needs_url check (status <> 'published' or coalesce(published_url, '') ~ '^https?://')
);
create index tasks_pic_idx on public.tasks (pic) where status <> 'completed';
create index tasks_project_idx on public.tasks (project_id);

create table public.task_checklist (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  text text not null,
  done boolean not null default false,
  position smallint not null default 0
);
create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  author uuid not null default auth.uid() references public.profiles (id),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create table public.task_files (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  path text not null,            -- storage object path (bucket "task-files")
  name text not null,
  uploaded_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);
-- Append-only: history is never updated or deleted (revisions keep earlier entries).
create table public.task_history (
  id bigint generated always as identity primary key,
  task_id uuid not null references public.tasks (id) on delete cascade,
  actor uuid references public.profiles (id),
  entry text not null,
  created_at timestamptz not null default now()
);
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  entity text not null,
  entity_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- Visibility helper: can the current user see this task?
create function public.can_see_task(t public.tasks) returns boolean language sql stable security definer set search_path = public as $$
  select public.is_owner()
      or (public.is_staff() and t.pic = auth.uid())
      or exists (select 1 from public.projects p where p.id = t.project_id and p.client_id in (select public.my_client_ids()))
$$;

-- Workflow guard (server-side, cannot be bypassed from the browser):
--  * only the Owner approves, requests revision from review, reassigns the PIC, or completes;
--  * a PIC may move only their own task; every change is written to history + audit log.
create function public.guard_task_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;            -- service role / SQL editor
  if not public.is_owner() then
    if old.pic is distinct from auth.uid() then raise exception 'Hanya PIC atau Owner yang dapat mengubah tugas ini'; end if;
    if new.pic is distinct from old.pic then raise exception 'Hanya Owner yang dapat mengubah PIC'; end if;
    if new.project_id <> old.project_id then raise exception 'Proyek tidak dapat diubah'; end if;
    if new.status in ('approved', 'completed') and new.status <> old.status then raise exception 'Hanya Owner yang dapat menyetujui atau menyelesaikan'; end if;
    if old.status = 'review' and new.status <> old.status then raise exception 'Tugas sedang menunggu approval Owner'; end if;
  end if;
  if new.status = 'completed' and old.status <> 'completed' then new.completed_at := now(); end if;
  if new.status is distinct from old.status or new.stage is distinct from old.stage or new.pic is distinct from old.pic then
    insert into public.task_history (task_id, actor, entry)
    values (new.id, auth.uid(), format('%s/%s → %s/%s', old.stage, old.status, new.stage, new.status)
      || case when new.pic is distinct from old.pic then ' · PIC diubah' else '' end);
    insert into public.audit_log (actor, action, entity, entity_id, detail)
    values (auth.uid(), 'task.update', 'tasks', new.id::text, jsonb_build_object('from', old.status, 'to', new.status, 'stage', new.stage));
  end if;
  return new;
end $$;
create trigger tasks_guard before update on public.tasks for each row execute function public.guard_task_update();

-- Only the Owner changes roles / activation.
create function public.guard_profile_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_owner() and (new.role <> old.role or new.active <> old.active) then
    raise exception 'Hanya Owner yang dapat mengubah peran';
  end if;
  if new.role is distinct from old.role then
    insert into public.audit_log (actor, action, entity, entity_id, detail) values (auth.uid(), 'role.change', 'profiles', new.id::text, jsonb_build_object('from', old.role, 'to', new.role));
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles for each row execute function public.guard_profile_update();

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_members enable row level security;
alter table public.leads enable row level security;
alter table public.quotations enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_checklist enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_files enable row level security;
alter table public.task_history enable row level security;
alter table public.audit_log enable row level security;

create policy profiles_read on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff());
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid() or public.is_owner()) with check (id = auth.uid() or public.is_owner());

create policy clients_read on public.clients for select to authenticated using (public.is_staff() or id in (select public.my_client_ids()));
create policy clients_write on public.clients for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy members_read on public.client_members for select to authenticated using (public.is_owner() or user_id = auth.uid());
create policy members_write on public.client_members for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Public lead capture: insert only, consent required, status forced to 'new'. Nobody but the Owner can read leads.
create policy leads_insert_public on public.leads for insert to anon, authenticated with check (consent and status = 'new' and notes = '');
create policy leads_owner on public.leads for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy quotes_owner on public.quotations for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy quotes_client_read on public.quotations for select to authenticated using (status in ('sent', 'accepted', 'revision') and client_id in (select public.my_client_ids()));

create policy projects_read on public.projects for select to authenticated using (
  public.is_owner() or client_id in (select public.my_client_ids())
  or (public.is_staff() and exists (select 1 from public.tasks t where t.project_id = projects.id and t.pic = auth.uid())));
create policy projects_write on public.projects for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy tasks_read on public.tasks for select to authenticated using (public.can_see_task(tasks));
create policy tasks_insert on public.tasks for insert to authenticated with check (public.is_owner());
create policy tasks_update on public.tasks for update to authenticated using (public.is_owner() or pic = auth.uid()) with check (public.is_owner() or pic = auth.uid());
create policy tasks_delete on public.tasks for delete to authenticated using (public.is_owner());

create policy checklist_read on public.task_checklist for select to authenticated using (exists (select 1 from public.tasks t where t.id = task_id and public.can_see_task(t)));
create policy checklist_write on public.task_checklist for all to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_id and (public.is_owner() or t.pic = auth.uid())))
  with check (exists (select 1 from public.tasks t where t.id = task_id and (public.is_owner() or t.pic = auth.uid())));

create policy comments_read on public.task_comments for select to authenticated using (public.is_staff() and exists (select 1 from public.tasks t where t.id = task_id and public.can_see_task(t)));
create policy comments_insert on public.task_comments for insert to authenticated with check (author = auth.uid() and public.is_staff() and exists (select 1 from public.tasks t where t.id = task_id and public.can_see_task(t)));

create policy files_read on public.task_files for select to authenticated using (public.is_staff() and exists (select 1 from public.tasks t where t.id = task_id and public.can_see_task(t)));
create policy files_insert on public.task_files for insert to authenticated with check (uploaded_by = auth.uid() and public.is_staff() and exists (select 1 from public.tasks t where t.id = task_id and public.can_see_task(t)));

create policy history_read on public.task_history for select to authenticated using (public.is_staff() and exists (select 1 from public.tasks t where t.id = task_id and public.can_see_task(t)));
-- Clients see task title/status/deadline of their own projects, but NOT internal comments, files or history
-- (client feedback and shared previews get their own tables in the portal phase).
create policy audit_owner on public.audit_log for select to authenticated using (public.is_owner());
-- No insert/update/delete policies on task_history / audit_log: only the definer triggers write them.

-- Table privileges (RLS still applies on top).
revoke all on all tables in schema public from anon;
grant insert on public.leads to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, update, delete on public.task_history, public.audit_log from authenticated;
revoke update, delete on public.task_comments, public.task_files from authenticated;
