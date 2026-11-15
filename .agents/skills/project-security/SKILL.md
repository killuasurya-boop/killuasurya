---
name: project-security
description: Audit and repair KILLUASURYA.TECH authentication, server actions, redirects, downloads and sensitive configuration.
---

- Validate identity using Supabase `getUser()` or verified claims, then read role and active status from `profiles`. Never authorize with user-editable metadata or demo cookies in live mode.
- Middleware is the first gate; RLS and RPCs must enforce authorization independently. Preserve session refresh/deletion cookies on redirects and prevent shared caching of auth and private API responses.
- Build email callbacks from `NEXT_PUBLIC_SITE_URL`, never Host or forwarded headers. Allow HTTPS, or HTTP on explicit loopback origins for local testing.
- Validate all action inputs server-side. Do not reveal account existence in login/reset messages. Do not log tokens, passwords, file contents or keys.
- Private downloads require an active user and an RLS-visible row. Signed links should be short-lived and sent with private, no-store headers.
- Reproduce security regressions in `tests/unit/` or `tests/database/`. Run `npm test` and `npm audit --audit-level=high`.

Source guidance: Supabase `supabase` and Vercel `react-best-practices` skills applied during the project hardening pass; current upstream documentation remains authoritative.
