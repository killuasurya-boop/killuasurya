import { TeamScreen } from '@/components/os/screens/Team';
import { TeamLive } from '@/components/os/screens/Live';
import { getTeam } from '@/server/data';
import { backendConfigured } from '@/server/supabase';

export default async function Page() {
  const data = backendConfigured ? await getTeam() : null;
  return data ? <TeamLive {...data} /> : <TeamScreen />;
}
