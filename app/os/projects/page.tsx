import { ProjectsScreen } from '@/components/os/screens/Projects';
import { ProjectsLive } from '@/components/os/screens/LiveWork';
import { getProjects } from '@/server/data';
import { demoUser } from '@/server/demo-session';
import { backendConfigured } from '@/server/supabase';

export default async function Page() {
  const data = backendConfigured ? await getProjects() : null;
  if (data) return <ProjectsLive {...data} />;
  const d = await demoUser();
  return <ProjectsScreen demoRole={d && d.role !== 'owner' ? 'staff' : 'owner'} />;
}
