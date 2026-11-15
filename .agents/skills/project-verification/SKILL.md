---
name: project-verification
description: Verify KILLUASURYA.TECH changes with security regressions, build checks, browser coverage and an evidence-based handoff.
---

1. Run `npm ci`, `npm test`, `npm run typecheck`, `npm audit --audit-level=high` and `npm run build`.
2. Use the production build for Playwright. Run affected interaction tests, desktop/mobile layout and WCAG checks. Broaden to the full existing suite for cross-cutting changes. Run `test:xbrowser` when browser-specific behavior changes.
3. Review visual comparisons before updating goldens. Keep stale baseline mismatches separate from runtime, layout and accessibility failures.
4. Demo tests require empty Supabase environment variables. Live tests require an explicitly local Supabase backend and disposable users. No live test may send production data or email.
5. Record commands, pass/fail counts, remaining defects and unavailable services in `docs/PROJECT_HEALTH.md`. Historical QA reports are historical evidence, not current verification.
6. Review `git diff --check` and the final diff, then prepare a focused PR with problem, behavior, validation and deployment/migration instructions. Never claim deployment or cloud verification based on local tests.
