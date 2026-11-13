import type { Metadata } from 'next';
import { TodayScreen } from '@/components/os/screens/Today';
import { getDashboard, getWaitingKits, getWorkspace } from '@/server/data';
import { demoUser } from '@/server/demo-session';
import { backendConfigured } from '@/server/supabase';

export const metadata: Metadata = { title: 'Hari Ini — Agency OS' };
export default async function Page() {
  if (!backendConfigured) { const d = await demoUser(); return <TodayScreen demoAs={d && d.role !== 'client' ? d.id : undefined} />; }
  const [live, dash] = await Promise.all([getWorkspace(), getDashboard()]);
  const kits = live?.me.role === 'owner' ? await getWaitingKits() : [];
  return <TodayScreen live={live ?? undefined} kits={kits} counts={dash ? { newLeads: dash.kpi.newLeads, quotesOpen: dash.kpi.quotesOpen } : undefined} />;
}
