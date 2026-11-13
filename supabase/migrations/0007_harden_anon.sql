-- 0007 — Hardening: tables added after 0001 received default Data API grants for `anon`. RLS already returns
-- nothing to anon, but anon has no business with them at all, so the grants are removed too. Run after 0006.
revoke all on public.project_materials, public.project_files from anon;
