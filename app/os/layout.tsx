import type { Metadata } from 'next';
import { AppShell } from '@/components/os/AppShell';
import { roleLabels } from '@/lib/workflow';
import { getNotifications } from '@/server/data';
import { demoUser } from '@/server/demo-session';
import { backendConfigured, currentUser } from '@/server/supabase';

export const metadata: Metadata = { title: 'Agency OS — KILLUASURYA.TECH', robots: { index: false } };

export default async function OsLayout({ children }: { children: React.ReactNode }) {
  if (!backendConfigured) {
    const d = await demoUser();
    return <AppShell user={d ? { name: d.name, role: `${d.label} (akun demo)`, roleId: d.role, demo: true } : undefined}>{children}</AppShell>;
  }
  const u = await currentUser();
  const notes = u ? await getNotifications().catch(() => []) : undefined;
  return <AppShell notes={notes} user={u ? { name: u.name || u.email, role: roleLabels[u.role] ?? u.role, roleId: u.role } : undefined}>{children}</AppShell>;
}
