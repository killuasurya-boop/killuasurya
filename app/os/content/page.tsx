import { ContentScreen } from '@/components/os/screens/Content';
import { ContentLive } from '@/components/os/screens/LiveBoard';
import { getWorkspace } from '@/server/data';
import { backendConfigured } from '@/server/supabase';

export default async function Page() {
  const data = backendConfigured ? await getWorkspace() : null;
  return data ? <ContentLive tasks={data.tasks} people={data.people} today={data.today} /> : <ContentScreen />;
}
