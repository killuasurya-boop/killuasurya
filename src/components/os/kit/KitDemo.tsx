'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimatedModal, Button, useToast } from '@/components/motion';
import { DEMO_TODAY } from '@/fixtures/workflow.demo';
import { demoKits, newDemoKit } from '@/fixtures/kit.demo';
import { templateById, type MaterialStatus } from '@/lib/templates';
import { Panel } from '../ui';
import { MaterialsPanel, NewProjectForm, PlanPreview, type KitProject } from './ProjectKit';

const demoWho = { owner: 'Surya (Owner)', planner: 'Roby', production: 'Ojak', editor: 'Ares', publisher: 'Bima' };

/** Demo of templated projects: materials checklist, reminder, start → plan with deadlines. Browser state only. */
export function KitDemo({ who = 'owner' }: { who?: 'owner' | 'staff' | 'client' }) {
  const toast = useToast();
  const [kits, setKits] = useState<KitProject[]>(demoKits);
  const [add, setAdd] = useState(false);
  const patch = (pid: string, f: (p: KitProject) => KitProject) => setKits((all) => all.map((p) => (p.id === pid ? f(p) : p)));
  const setM = (pid: string) => (id: string, status: MaterialStatus, note?: string) => {
    patch(pid, (p) => ({ ...p, materials: p.materials.map((m) => (m.id === id ? { ...m, status, note: note ?? m.note } : m)) }));
    toast({ tone: 'success', title: status === 'sent' ? 'Terima kasih, tim kami akan mengecek' : 'Status bahan diperbarui', body: 'DATA DEMO — tidak tersimpan' });
  };
  return (
    <>
      {kits.map((p) => (
        <Panel key={p.id} id={`p-${p.id}`} title={`${p.client} · ${p.name}`} action={who === 'owner' && p === kits[0] ? <Button size="sm" icon={<Plus size={18} aria-hidden="true" />} onClick={() => setAdd(true)}>Proyek baru</Button> : undefined}>
          <MaterialsPanel p={p} who={who} today={DEMO_TODAY}
            onSet={who === 'client' ? undefined : (id, s) => setM(p.id)(id, s)}
            onSent={who === 'client' ? (id, note) => setM(p.id)(id, 'sent', note) : undefined}
            onUpload={(id, f) => {
              patch(p.id, (x) => ({ ...x, materials: x.materials.map((m) => (m.id === id ? { ...m, files: [...(m.files ?? []), { id: `demo-${Date.now()}`, name: f.name, size: f.size }], status: m.status === 'missing' || (m.status === 'sent' && who !== 'client') ? (who === 'client' ? 'sent' : 'received') : m.status } : m)) }));
              toast({ tone: 'success', title: 'File tercatat', body: 'DATA DEMO — file tidak benar-benar diunggah.' });
            }}
            onStart={(d) => { patch(p.id, (x) => ({ ...x, startDate: d })); toast({ tone: 'success', title: `Jam ${templateById(p.template)?.workdays} hari kerja dimulai`, body: 'Deadline semua tugas sudah dihitung (DATA DEMO).' }); }} />
          {who !== 'client' && p.template && <div style={{ marginTop: 14 }}><PlanPreview templateId={p.template} start={p.startDate} who={demoWho} /></div>}
        </Panel>
      ))}
      <AnimatedModal open={add} onClose={() => setAdd(false)} title="Proyek baru">
        <NewProjectForm today={DEMO_TODAY} onCancel={() => setAdd(false)} onSubmit={(v) => {
          if (!v.template) { toast({ tone: 'info', title: 'Proyek kosong', body: 'Di mode demo hanya template yang ditampilkan.' }); setAdd(false); return; }
          setKits((all) => [newDemoKit(all.length + 1, v.client.trim(), v.project.trim(), v.template, v.materialsDue), ...all]);
          setAdd(false); toast({ tone: 'success', title: 'Proyek dibuat dari template', body: 'DATA DEMO — tidak tersimpan' });
        }} />
      </AnimatedModal>
    </>
  );
}
