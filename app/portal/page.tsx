import type { Metadata } from 'next';
import { PortalScreen } from '@/components/os/screens/Portal';
import { PortalLive } from '@/components/os/screens/Live';
import { signOut } from '@/server/actions/auth';
import { getPortal } from '@/server/data';
import { demoUser } from '@/server/demo-session';
import { backendConfigured } from '@/server/supabase';

export const metadata: Metadata = { title: 'Portal Klien — KILLUASURYA.TECH', robots: { index: false } };

export default async function Page() {
  const data = backendConfigured ? await getPortal() : null;
  if (!data) return (await demoUser()) ? <PortalScreen onSignOut={signOut} /> : <PortalScreen />;   // demo mode
  return <PortalScreen onSignOut={signOut}><PortalLive data={data} /></PortalScreen>;
}
