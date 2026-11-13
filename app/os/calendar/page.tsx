import { CalendarScreen } from '@/components/os/screens/Calendar';
import { demoKits } from '@/fixtures/kit.demo';
import { DEMO_TODAY, workflowTasks } from '@/fixtures/workflow.demo';
import { buildEvents } from '@/lib/calendar';
import { getProjects, getWorkspace } from '@/server/data';
import { backendConfigured } from '@/server/supabase';

export default async function Page() {
  if (!backendConfigured) return <CalendarScreen demo today={DEMO_TODAY} events={buildEvents(workflowTasks, demoKits, DEMO_TODAY)} />;
  const [ws, pr] = await Promise.all([getWorkspace(), getProjects()]);
  const today = ws?.today ?? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  return <CalendarScreen today={today} events={buildEvents(ws?.tasks ?? [], (pr?.projects ?? []).filter((p) => !p.completed), today)} />;
}
