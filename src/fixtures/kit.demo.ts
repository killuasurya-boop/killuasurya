import { templateById, type MaterialStatus } from '@/lib/templates';
import type { KitProject } from '@/components/os/kit/ProjectKit';

/** DATA DEMO — one templated project waiting for client materials (mirrors the Owner's real year-end event gig, fictional client). */
const tpl = templateById('landing-event')!;
const seed: MaterialStatus[] = ['received', 'missing', 'sent', 'missing', 'received', 'missing', 'missing', 'received', 'missing', 'missing'];
export const demoKits: KitProject[] = [{
  id: 'KIT-1', name: 'Landing Page Malam Puncak Akhir Tahun', client: 'Klien Demo C (Event)', template: tpl.id, materialsDue: '2026-11-13', startDate: null,
  materials: tpl.materials.map((m, i) => ({ ...m, id: `M-${i + 1}`, status: seed[i], note: seed[i] === 'sent' ? 'Sudah dikirim lewat WA (DATA DEMO)' : '' })),
}];
export const newDemoKit = (n: number, client: string, name: string, template: string, materialsDue: string): KitProject => {
  const t = templateById(template)!;
  return { id: `KIT-${n}`, name, client, template, materialsDue: materialsDue || null, startDate: null, materials: t.materials.map((m, i) => ({ ...m, id: `M${n}-${i + 1}`, status: 'missing', note: '' })) };
};
