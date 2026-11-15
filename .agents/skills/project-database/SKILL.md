---
name: project-database
description: Change KILLUASURYA.TECH Supabase schema, RLS, Storage and workflow safely, with isolated SQL verification.
---

1. Read `docs/BACKEND_SETUP.md`, current migrations and the Supabase changelog/docs for the affected feature. Discover CLI flags with `--help`.
2. Treat deactivation as a database concern: an old JWT may remain valid. Check active status in RLS and in membership helpers used by SECURITY DEFINER RPCs.
3. Every exposed table needs RLS and explicit grants. UPDATE requires SELECT visibility and WITH CHECK. Membership must limit client access to their own projects. A PIC field alone must never grant staff rights.
4. Prefer invoker functions. Any necessary definer function needs a fixed search_path, caller authorization and restricted EXECUTE grants. Views must respect RLS. Storage policies must match the application's project access model.
5. Create additive migrations with `supabase migration new <name>`; keep applied migrations immutable. Verify locally, inspect advisors on the actual Supabase environment when available, and report limitations.
6. Run `npm run test:db`: PGlite executes every migration and tests PostgreSQL RLS/functions/triggers with minimal Auth/Storage schema stubs. It does not verify Supabase HTTP Auth, Storage uploads, emails or cloud settings. Use the local Supabase live suite for those; never production.

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security
