import type { Metadata } from 'next';
import { TasksScreen } from '@/components/os/screens/Tasks';
import { getWorkspace } from '@/server/data';
import { demoUser } from '@/server/demo-session';
import { backendConfigured } from '@/server/supabase';

export const metadata: Metadata = { title: 'Tugas & Approval — Agency OS' };
export default async function Page() {
  if (!backendConfigured) { const d = await demoUser(); return <TasksScreen demoAs={d && d.role !== 'client' ? d.id : undefined} />; }
  const live = await getWorkspace();
  return <TasksScreen live={live ?? undefined} />;
}
