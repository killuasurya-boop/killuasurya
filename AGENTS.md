# KILLUASURYA.TECH project instructions

Read README.md and docs/PROJECT_HEALTH.md before changing this project. User instructions take precedence.

This repo combines a public agency website, Agency OS (`/os`) and client portal (`/portal`). Keep Indonesian copy, approved Knewave/Inter typography, Electric Doodle identity, original assets and dark/light themes. Preserve demo mode, clearly marked fixture data and honest integration statuses.

Apply the relevant local skills under `.agents/skills/`:

- `project-security/SKILL.md`: authentication, middleware, actions, downloads and secrets.
- `project-database/SKILL.md`: Supabase migrations, RLS, Storage, roles and workflow.
- `project-ui/SKILL.md`: React, accessibility, responsive behavior and motion.
- `project-verification/SKILL.md`: tests, build, dependency checks and handoff.

Use a focused branch. Keep database changes additive; never edit already-applied migrations or point tests at production. Never add a service-role key to application code. Do not activate external integrations, send messages, merge, deploy, or apply cloud migrations without authorization for that action. Implement and verify locally, then prepare a reviewable PR.

Run `npm ci`, `npm test`, `npm run typecheck`, `npm run build` and browser checks relevant to the change. A missing credential or tool is an explicit verification limit, never evidence of success. Do not regenerate visual goldens just to hide a failure.
