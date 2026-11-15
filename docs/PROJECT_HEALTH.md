# Project health — 15 November 2026

This is the current engineering handoff. `FINAL_REPORT.md` and phase reports describe earlier frontend milestones; they do not certify today's backend or deployment.

## Installed project skills

`AGENTS.md` routes work to four repository-local skills in `.agents/skills/`: security, database, UI and verification. These are curated, project-specific working instructions derived from the applicable Supabase, React and UI audit guidance, not installations of unrelated plugins or copies of the entire external skill catalog.

## Findings repaired

| Finding | Result |
|---|---|
| Middleware discarded refreshed/expired cookies on role/login redirects | Redirects preserve all session cookies, including chunks and deletions; auth responses prevent shared caching. API/auth/password routes also refresh sessions. |
| Password-reset callback trusted incoming forwarded host/protocol | Callback now uses the configured `NEXT_PUBLIC_SITE_URL` origin; HTTPS is required outside explicit loopback development. |
| Deactivation was checked in the UI/middleware but not all RLS/RPC membership paths | Additive migration enforces active-account restrictions on all 14 app tables and project Storage; membership helper returns no clients for an inactive account. |
| A client assigned as PIC could acquire checklist write access | Task/checklist policies require an active staff role in addition to PIC/Owner authorization. |
| New material/file tables depended on legacy automatic grants | Migration explicitly grants authenticated access where needed, retaining RLS and revoking anon access through prior migration 0007. |
| Live render could fall back to demo UI after losing its session | Workspace layout and portal recheck the live session and redirect instead. |
| Loading button could be re-enabled by a later prop spread | Computed loading/disabled state takes precedence. Reset form also guards repeated submissions and offers retry after failures. |
| Repeated server user/profile requests | React `cache` deduplicates `currentUser()` per render request without cross-user shared state. |
| API errors and signed-download redirects lacked explicit cache defenses | Security headers and private/no-store policies cover API/auth responses, including errors. |
| Live integration tests could be pointed at a remote backend | Test configuration rejects non-loopback app/API URLs and requires an explicit API_URL. |
| No automated quality workflow or durable project guidance | Added project skills, AGENTS.md, isolated SQL/unit regression tests and a GitHub Actions workflow. |
| Screenshot references predated existing navigation/WhatsApp changes and the Today/Overview split | Visual tests now cover `/os` as `os-today` and `/os/overview` as `os-dashboard`; references are aligned with the existing application, without changing its design. |
| Project/template/task creation spanned separate HTTP transactions and ignored some checklist failures | Two invoker RPCs create each complete unit of work in one transaction, retaining RLS. Late failures roll back all related inserts. Tests cover rollback, role restrictions, every committed template and the complete lead-to-completion workflow. |
| Hostinger's auth callback redirected to its internal `0.0.0.0:3000` origin | Callback success/failure redirects now use the validated public site origin. The issue was reproduced on the live deployment using an invalid token; no real credential or user data was submitted. |

## Verification

| Check | Result |
|---|---|
| `npm test` | 4 auth/redirect/test-safety unit checks and 6 PostgreSQL migration/RLS checks passed. |
| SQL regression control | Without the new migration, 3 of the 6 database checks fail: active-account policy coverage, inactive-client access, and client-as-PIC checklist access. With the migration, all 6 pass. |
| `npm run typecheck` / `npm run build` | Passed on the production Next.js build. Google Fonts access was required for `next/font`. |
| `npm audit` | 0 reported vulnerabilities, including the newly pinned test dependencies. |
| Chromium nonvisual suite | 617 cases scheduled across five viewport sizes: 612 passed initially, 1 intentionally skipped mobile-only test, and 4 artifact-cleanup errors caused by concurrent Playwright processes sharing an output directory. All 4 affected cases passed in a separate run with isolated artifacts: 616 applicable cases verified in total. No application assertion remained failing. |
| Visual comparisons | 36/36 passed in a separate confirmation run **without** `--update-snapshots`, covering six surfaces, two themes and three viewport sizes. |
| Firefox interaction/security suite | Initial run: 25 passed, 1 intentionally skipped mobile-only test, 1 login-navigation timeout under concurrent load. Isolated recheck: 1/1 passed (26 applicable cases verified in total). |
| WebKit / full Supabase HTTP integration | Not run: WebKit's system libraries were unavailable and root installation failed; Docker socket access was unavailable for a local Supabase stack. PGlite does not cover those services. |
| GitHub CI for `40eec27` | Full quality workflow completed successfully, including all build, audit, unit/SQL and Chromium/visual steps: https://github.com/killuasurya-boop/killuasurya/actions/runs/43752854201 |
| Atomic-creation/auth-callback follow-up | 5 unit checks and 13 SQL checks passed; typecheck and production build passed; 9 affected desktop/mobile browser checks passed. Read-only release diagnostics were tested against the ephemeral PostgreSQL schema. |

Commands:

```sh
npm ci
npm test
npm run typecheck
npm audit --audit-level=high
npm run build
npm run test:e2e -- --grep-invert @visual
npm run test:visual
```

`npm test` runs auth/redirect/safety unit checks and actual PostgreSQL SQL/RLS/function/trigger checks in ephemeral PGlite. The database suite applies every committed migration and never uses cloud credentials. It uses minimal Auth/Storage schema stubs; it is not a substitute for Supabase HTTP Auth/Storage/email integration testing.

The CI workflow runs those checks plus Chromium layout/accessibility/interactions at five viewport sizes and visual comparisons at desktop/tablet/mobile sizes. Screenshots are retained on failure. Cross-browser/performance suites remain explicit checks because engine dependencies and timing vary by environment. Do not overwrite goldens to hide unexplained differences.

The old workspace reference showed “Agency OS Lead-to-Project” at `/os`, while the existing app renders “Hari Ini” there and keeps the overview at `/os/overview`. Home references also showed the previous navigation and CTAs. The application files for these surfaces were unchanged by this branch. Two initial workspace comparisons failed for this inherited mismatch; the references were then refreshed against the current routes with separate Today/Overview coverage. This is test maintenance, not a new visual design.

## Applying the database repair

New projects: apply every migration in filename order. Existing installations with 0001–0007 already applied: review and apply `20261115190835_harden_inactive_accounts.sql`, then `20261115203528_atomic_project_creation.sql` through the normal Supabase deployment process. They change policies/functions/grants and do not remove business data. The first intentionally revokes inactive-user access with an existing JWT. The second must be applied before deploying the application version calling the new creation RPCs.

This working branch does not apply migrations to the cloud or deploy the application. After rollout, verify with active Owner/staff/client users and an inactive user with an existing session. Run Supabase security advisors on the actual target project.

## Configuration and remaining external work

- Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS origin and allowlist the exact `/auth/confirm` callback in Supabase Auth. Local live tests use `http://localhost:3200` and an explicitly local `API_URL`.
- Cloud Auth settings, SMTP delivery, real Storage uploads and service-specific integrations still need verification in the target environment. No cloud credentials or admin keys are added to the repo.
- Operations, Publishing, WhatsApp, Reports, Media and Settings retain their existing honest DATA DEMO states. Provider OAuth, credentials and business configuration are prerequisites for live features; a repair must not simulate successful publishing or messaging.
- Public lead capture has a basic honeypot, client timing hints and database caps. The public RPC accepts a caller-provided sender hash, so per-sender limits are not a strong abuse boundary. A trusted server gateway/CAPTCHA and concurrent-load validation remain needed before relying on it for sustained bot protection.
- The atomic-creation repair is ready in code and isolated tests; its RPCs still need rollout and real Supabase HTTP integration verification.
- The existing favicon/official square app-icon requirement remains unresolved; no substitute brand mark has been invented.
- These changes fix the verified issues above. They do not certify every integration, every cloud setting, or every possible application state.

Reference documentation consulted: Supabase changelog, Next.js SSR Auth and redirect URL guidance; Vercel React best practices; Impeccable technical audit and craft guidance. The Impeccable launcher was unavailable, so project context was read directly. No new visual direction was generated.

Current hosting discovery and access prerequisites are recorded in `RELEASE_READINESS.md`: the production domain is already on Hostinger; the documented Supabase target returned a permission error on the connected account. Other accessible projects were not changed.
