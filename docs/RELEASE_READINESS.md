# Release readiness — 15 November 2026

## Verified state

- The GitHub quality run for commit `40eec27` passed every step: dependency install, unit/SQL tests, typecheck, audit, production build and the full Chromium suite including visual regression. Evidence: https://github.com/killuasurya-boop/killuasurya/actions/runs/43752854201
- `https://killuasurya.tech` returns HTTP 200 and identifies Hostinger hosting. The live `/os` route redirects signed-out requests to `/login?next=%2Fos`; the login does not show the demo account picker. The site already has a live-mode deployment.
- The new response security/cache headers were absent from the inspected deployment. `/auth/confirm?token_hash=invalid` also redirected to `https://0.0.0.0:3000/forgot-password?expired=1`, exposing the hosting server's internal origin instead of the public domain. A green repository check does not establish that the running site has the new code.
- The connected Supabase account does not list `killuasurya-tech`. Direct access to documented project `xbkdepprinqwbuvpqtkm` returned a permission error. Other accessible projects are not substitutes and were not modified.
- The Hostinger MCP server was added to the local Codex configuration during this follow-up. OAuth authorization is still required and Hostinger account tools are not available in this session. Deployment settings, environment variables and rollback facilities could not be inspected. After authorizing the account, start a new Codex session so the connection's tools load.

## Prepared code

PR #2 contains project skills, access/session hardening and automated quality checks. The follow-up adds atomic project/task creation: the project, materials, plan and checklist either all persist or all roll back. Database tests include an intentionally failing late trigger, every committed project template, and the complete consented-lead → quote → project → editor → client → publisher → completion workflow.

The follow-up also fixes the confirmed Hostinger callback issue: successful and expired auth links now redirect using the validated `NEXT_PUBLIC_SITE_URL` origin rather than the internal request host. A browser regression supplies an internal Host and an untrusted forwarded host to verify that neither controls the destination.

These SQL tests run in disposable PostgreSQL/PGlite with Auth/Storage schema stubs. They verify database behavior and authorization, not real email delivery, browser login against Supabase, or Storage HTTP uploads.

Follow-up validation: 5 unit checks and 13 SQL checks passed, typecheck and the production build passed, and 9 affected desktop/mobile browser checks passed, including the reverse-proxy callback regression. The deployment checker reached all seven production routes when this environment's proxy support was enabled (`NODE_USE_ENV_PROXY=1`); it correctly reported the inspected live release's missing response headers and internal-host callback redirect. This is pending rollout, not evidence that the new version has been deployed.

The Cloud environment reports an enabled shared desktop, but no desktop JavaScript or viewer-opening tool is offered in this session. That prevents an in-session browser handoff for the CLI's loopback OAuth callback. Environment: `ccarenv_b64_Y2NhcmVudl8wN2MwNDlmMmE3ZGM4MTkxOGQwMzljNzgxMTdmN2I4Nw`. Account authorization can instead be completed through the user's configured Hostinger connection and a new Codex session.

## Rollout order once target access is available

1. Inspect the actual Hostinger application, its Git branch, runtime, environment variable names, existing Supabase URL, current release and rollback method. Keep values and tokens out of logs and commits. Confirm that the target is `killuasurya.tech`.
2. Verify the existing backup and restore process. Use staging/disposable data for restore and workflow tests; do not run the destructive live suite against production.
3. In staging, apply unapplied migrations in filename order after 0001–0007: `20261115190835_harden_inactive_accounts.sql`, then `20261115203528_atomic_project_creation.sql`. The application version using the new creation RPCs requires the second migration before it serves traffic.
4. Run `supabase/release_checks.sql` and Supabase security advisors on that target. Resolve unexpected results before rollout.
5. Configure the exact staging/production `NEXT_PUBLIC_SITE_URL` and Auth callback allowlist. Verify invite/reset email delivery with dedicated test recipients and confirm the private Storage bucket.
6. Deploy the reviewed build to staging. Run `npm run check:deployment -- https://<staging-domain>`; it performs only GET requests and sends no credentials, emails or business data.
7. Complete the UAT matrix below with disposable records, then prepare the exact production changes and rollback instructions for approval before overwriting the live Hostinger site.
8. After approved production rollout, run the same read-only deployment checks, inspect runtime/Auth errors and verify one authorized business transaction. Record release SHA, migration versions and test results.

The migrations add policies/grants/functions and do not delete business data. Do not remove migrations/functions merely to roll back the app: the previous app can remain deployed while additive changes are investigated. Reverting the app should use the hosting platform's verified release rollback.

## UAT acceptance matrix

| Actor | Action | Expected evidence |
|---|---|---|
| Visitor | Submit a consented brief in staging | One CRM lead; invalid input/absent consent is refused. |
| Owner | Create, approve and accept a quotation | Database-calculated total; approved items remain locked; PDF matches. |
| Owner | Convert quote to project, create template/task | Correct client, PICs, materials and ordered checklists; a failed creation leaves no partial project. |
| Client | Upload materials for own project | File is private; Owner can download it; another client cannot. |
| Owner | Start project before/after required materials | Blocked before readiness; workday deadlines appear after readiness. |
| Editor | Work on assigned task and submit review | Own work is visible; reassignment/Owner approval cannot be performed by Editor. |
| Client | Request revision, then approve corrected preview | Correct project only; revision note and history persist; internal comments stay private. |
| Publisher | Schedule and record publication | Publishing without a link fails; the valid link is preserved. |
| Owner | Complete the published task | Completed status and timestamp; history and audit remain intact. |
| Inactive user | Reuse an existing session | Workspace, project rows, RPCs and private files remain inaccessible. |
| Invite/reset recipient | Choose a password and sign in | Correct same-site callback, private session, expired-link recovery. |
| Team | Use mobile and desktop | Clear next actions, working keyboard access, no hidden content/overflow. |

## Business pilot

Once staging UAT passes, use one agreed project with an Owner, a staff member and a client. Record delivery date, overdue work, approval waiting time and lead-to-project conversion from real records. Publishing/WhatsApp and other modules marked DATA DEMO stay labeled until the respective official accounts, permissions and integrations are configured and verified. No trial result or customer approval is implied by automated tests.
