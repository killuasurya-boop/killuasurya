/**
 * DEMO MODE accounts — only active when NO backend is configured (no Supabase env). They let the Owner try
 * the login flow and each role's view on a local preview. They are not real users, hold no data, and the
 * code path is skipped entirely in live mode (see signIn in src/server/actions/auth.ts).
 */
export const DEMO_PASSWORD = 'demo12345';
export const demoAccounts = [
  { id: 'surya', email: 'owner@demo.killuasurya.tech', name: 'Surya', role: 'owner', label: 'Owner', home: '/os' },
  { id: 'roby', email: 'roby@demo.killuasurya.tech', name: 'Roby', role: 'planner', label: 'Ideation & Planning', home: '/os/tasks' },
  { id: 'ojak', email: 'ojak@demo.killuasurya.tech', name: 'Ojak', role: 'production', label: 'Production Preparation', home: '/os/tasks' },
  { id: 'ares', email: 'ares@demo.killuasurya.tech', name: 'Ares', role: 'editor', label: 'Editing', home: '/os/tasks' },
  { id: 'bima', email: 'bima@demo.killuasurya.tech', name: 'Bima', role: 'publisher', label: 'Publishing', home: '/os/tasks' },
  { id: 'klien', email: 'klien@demo.killuasurya.tech', name: 'Klien Demo', role: 'client', label: 'Klien', home: '/portal' },
] as const;
export type DemoAccount = (typeof demoAccounts)[number];
export const DEMO_COOKIE = 'ks_demo_user';
export const demoById = (id: string | undefined) => demoAccounts.find((a) => a.id === id);
