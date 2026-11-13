import type { Task } from './workflow';
import { dueFor, templateById, type Material } from './templates';

export type CalKind = 'deadline' | 'publish' | 'review' | 'start' | 'material';
export type CalEvent = { date: string; title: string; kind: CalKind; meta: string; href: string; late?: boolean };
export const calKinds: Record<CalKind, string> = { deadline: 'Deadline tugas', publish: 'Jadwal/terbit', review: 'Approval', start: 'Mulai / target proyek', material: 'Tenggat bahan klien' };

type Kit = { id: string; name: string; client: string; template: string | null; materialsDue: string | null; startDate: string | null; materials: Material[] };
const DONE = ['approved', 'published', 'completed'];

/** Calendar = what is already in the system: task deadlines, project start/target dates, client material deadlines. Nothing invented. */
export function buildEvents(tasks: Task[], kits: Kit[], today: string): CalEvent[] {
  const ev: CalEvent[] = [];
  for (const t of tasks) {
    if (!t.due || t.status === 'completed') continue;
    const kind: CalKind = ['scheduling', 'publishing'].includes(t.stage) ? 'publish' : t.status === 'review' ? 'review' : 'deadline';
    ev.push({ date: t.due, title: t.title, kind, meta: `${t.client} · ${t.project}`, href: `/os/tasks?task=${t.id}`, late: t.due < today && !DONE.includes(t.status) });
  }
  for (const k of kits) {
    const href = `/os/projects#p-${k.id}`;
    if (k.startDate) {
      ev.push({ date: k.startDate, title: `Mulai: ${k.name}`, kind: 'start', meta: k.client, href });
      const tpl = templateById(k.template);
      if (tpl) ev.push({ date: dueFor(k.startDate, tpl.workdays), title: `Target selesai: ${k.name}`, kind: 'start', meta: k.client, href });
    } else if (k.materialsDue) {
      const missing = k.materials.filter((m) => m.required && m.status !== 'received' && m.status !== 'fallback').length;
      ev.push({ date: k.materialsDue, title: `Tenggat bahan: ${k.name}`, kind: 'material', meta: `${k.client}${missing ? ` · kurang ${missing} bahan wajib` : ' · lengkap'}`, href, late: missing > 0 && k.materialsDue < today });
    }
  }
  return ev.sort((a, b) => a.date.localeCompare(b.date));
}
