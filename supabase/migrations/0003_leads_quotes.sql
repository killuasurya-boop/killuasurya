-- 0003: anti-spam for public lead capture, quotation workflow, project completion.

-- ---------- Lead capture goes through ONE gate ----------
-- Anonymous visitors can no longer insert into `leads` directly; they call submit_lead(), which
-- rate-limits per (hashed) sender and globally. No raw IP address is stored — only a salted hash.
drop policy if exists leads_insert_public on public.leads;
revoke insert on public.leads from anon;
alter table public.leads add column if not exists sender_hash text;
create index if not exists leads_created_idx on public.leads (created_at desc);

create function public.submit_lead(p jsonb, p_sender text) returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if coalesce((p ->> 'consent')::boolean, false) is not true then raise exception 'consent_required'; end if;
  if char_length(coalesce(p_sender, '')) not between 16 and 128 then raise exception 'invalid_sender'; end if;
  if (select count(*) from public.leads where sender_hash = p_sender and created_at > now() - interval '1 hour') >= 3 then raise exception 'rate_limited'; end if;
  if (select count(*) from public.leads where created_at > now() - interval '1 hour') >= 40 then raise exception 'rate_limited'; end if;
  insert into public.leads (name, contact, business, services, package_code, needs, budget, source, consent, sender_hash)
  values (left(trim(p ->> 'name'), 120), left(trim(p ->> 'contact'), 160), left(coalesce(p ->> 'business', ''), 200),
          coalesce((select array_agg(left(x, 60)) from jsonb_array_elements_text(coalesce(p -> 'services', '[]'::jsonb)) x), '{}'),
          nullif(left(coalesce(p ->> 'package_code', ''), 20), ''), left(coalesce(p ->> 'needs', ''), 4000), left(coalesce(p ->> 'budget', ''), 120), 'website', true, p_sender)
  returning id into new_id;
  return new_id;
end $$;
revoke all on function public.submit_lead(jsonb, text) from public;
grant execute on function public.submit_lead(jsonb, text) to anon, authenticated;

-- ---------- Quotations ----------
alter table public.quotations add column if not exists client_name text not null default '';
alter table public.quotations add column if not exists notes text not null default '';
alter table public.quotations add column if not exists sent_at timestamptz;
alter table public.quotations add column if not exists project_id uuid references public.projects (id) on delete set null;

-- Items are [{desc, qty, price}]; the total is always recomputed here, never trusted from the browser.
create function public.guard_quotation() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if jsonb_typeof(new.items) <> 'array' or jsonb_array_length(new.items) > 50 then raise exception 'Item penawaran tidak valid'; end if;
  select coalesce(sum(greatest((i ->> 'qty')::numeric, 0) * greatest((i ->> 'price')::numeric, 0)), 0) into new.total from jsonb_array_elements(new.items) i;
  if tg_op = 'UPDATE' then
    if old.status in ('accepted', 'rejected') and new.status <> old.status then raise exception 'Penawaran sudah final'; end if;
    if old.status <> 'draft' and old.status <> 'revision' and new.items is distinct from old.items then raise exception 'Item hanya bisa diubah saat Draft atau Revisi'; end if;
    if new.status = 'sent' and old.status <> 'sent' then
      if jsonb_array_length(new.items) = 0 then raise exception 'Tambahkan minimal satu item'; end if;
      new.approved_by := auth.uid(); new.approved_at := now(); new.sent_at := now();
    end if;
    if new.status is distinct from old.status then
      insert into public.audit_log (actor, action, entity, entity_id, detail) values (auth.uid(), 'quotation.status', 'quotations', new.id::text, jsonb_build_object('from', old.status, 'to', new.status, 'total', new.total));
    end if;
  end if;
  return new;
end $$;
create trigger quotations_guard before insert or update on public.quotations for each row execute function public.guard_quotation();

-- Accepted quotation → project (Owner). Idempotent: returns the existing project if already converted.
create function public.quotation_to_project(p_quote uuid) returns uuid language plpgsql security definer set search_path = public as $$
declare q public.quotations; p uuid;
begin
  if not public.is_owner() then raise exception 'Hanya Owner'; end if;
  select * into q from public.quotations where id = p_quote for update;
  if not found then raise exception 'Penawaran tidak ditemukan'; end if;
  if q.project_id is not null then return q.project_id; end if;
  if q.status <> 'accepted' then raise exception 'Penawaran belum diterima klien'; end if;
  p := public.create_project(coalesce(nullif(trim(q.client_name), ''), 'Klien'), q.title);
  update public.quotations set project_id = p, client_id = (select client_id from public.projects where id = p) where id = p_quote;
  if q.lead_id is not null then update public.leads set status = 'won' where id = q.lead_id; end if;
  return p;
end $$;
revoke all on function public.quotation_to_project(uuid) from public, anon;
grant execute on function public.quotation_to_project(uuid) to authenticated;
