import { DashboardScreen } from '@/components/os/screens/Dashboard';
import { DashboardLive } from '@/components/os/screens/LiveBoard';
import { getDashboard } from '@/server/data';
import { backendConfigured } from '@/server/supabase';

export default async function Page() {
  const data = backendConfigured ? await getDashboard() : null;
  return data ? <DashboardLive data={data} /> : <DashboardScreen />;
}
