'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Clapperboard, RotateCcw, ShieldAlert } from 'lucide-react';
import { AnimatedTabs, Button, useToast } from '@/components/motion';
import { Avatar, DemoNote, FlowChevrons, PageHeader, Panel, StatusPill, osUi } from '../ui';
import { contentItems as seed, contentStages } from '@/fixtures/os.demo';
import { opsFlows } from '@/content/services';
import { bezier, duration, inViewOnce } from '@/motion/tokens';
import p from '../pages.module.css';

type Item = (typeof seed)[number];

function StageTrack({ stage }: { stage: string }) {
  const idx = contentStages.indexOf(stage as (typeof contentStages)[number]);
  return (
    <ol aria-label={`Tahap ${idx + 1} dari ${contentStages.length}: ${stage}`} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: `repeat(${contentStages.length}, 1fr)`, gap: 3, minWidth: 160 }}>
      {contentStages.map((s, i) => (
        <li key={s} title={s} aria-hidden="true" style={{ height: 6, borderRadius: 3, overflow: 'hidden', background: 'var(--grid)' }}>
          <motion.span style={{ display: 'block', height: '100%', background: i < idx ? 'var(--c2)' : i === idx ? 'var(--c1)' : 'transparent', transformOrigin: 'left' }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={inViewOnce} transition={{ delay: i * 0.05, duration: 0.3 }} />
        </li>
      ))}
    </ol>
  );
}

export function ContentScreen() {
  const toast = useToast();
  const [items, setItems] = useState<Item[]>(seed);
  const [tab, setTab] = useState('all');
  const list = items.filter((i) => tab === 'all' || (tab === 'review' ? ['CLIENT_REVIEW'].includes(i.status) : tab === 'prod' ? ['SHOOTING', 'EDITING', 'SCRIPT_READY'].includes(i.status) : i.status === 'SCHEDULED'));
  const review = items.find((i) => i.status === 'CLIENT_REVIEW');

  const decide = (it: Item, ok: boolean) => {
    setItems((l) => l.map((x) => (x.id === it.id ? { ...x, status: ok ? 'SCHEDULED' : 'EDITING', stage: ok ? 'Scheduling / Publishing' : 'Editing / QC' } : x)));
    toast({ tone: ok ? 'success' : 'info', title: ok ? 'Disetujui (demo) → Scheduling' : 'Revisi → kembali ke Ares (Editing / QC)', body: it.title });
  };

  return (
    <div className={p.stack}>
      <PageHeader title="Content" highlight="Production OS" sub="Dari strategi sampai analitik — setiap tahap punya PIC, gate, dan approval yang jelas." />
      <DemoNote>Item konten fiktif. Status hanya berubah di pratinjau.</DemoNote>
      <Panel title="Alur Produksi Konten" icon={<Clapperboard size={18} />}>
        <FlowChevrons label="Alur produksi konten" steps={opsFlows[1].steps.map((label) => ({ label, decision: label.endsWith('?') }))} />
        <p className={p.muted} style={{ margin: '8px 0 0', color: 'var(--coral-ink)' }}>{opsFlows[1].loop}</p>
      </Panel>

      <div className={p.main2}>
        <Panel title="Workspace Produksi" icon={<Clapperboard size={18} />} action={<AnimatedTabs label="Filter konten" value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'Semua' }, { id: 'prod', label: 'Produksi' }, { id: 'review', label: 'Review' }, { id: 'sched', label: 'Terjadwal' }]} />} pad={false}>
          <div className={osUi.tableWrap} tabIndex={0} role="region" aria-label="Tabel (dapat digeser)">
            <table className={osUi.table}>
              <thead><tr><th>Konten</th><th>PIC</th><th>Tahap</th><th>Progres tahap</th><th>Target</th><th>Status</th></tr></thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {list.map((c) => (
                    <motion.tr key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: duration.toggle }}>
                      <td><strong>{c.title}</strong><div className={p.muted}>{c.id} · {c.client} · {c.format}</div></td>
                      <td><Avatar id={c.pic} /></td><td><span className={p.tag}>{c.stage}</span></td>
                      <td><StageTrack stage={c.stage} /></td><td>{c.due}</td><td><StatusPill status={c.status} /></td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Approval Konten" icon={<ShieldAlert size={18} />}>
          <AnimatePresence mode="wait">
            {review ? (
              <motion.div key={review.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: duration.modal, ease: bezier.out }} style={{ display: 'grid', gap: 12 }}>
                <div style={{ aspectRatio: '9 / 12', maxHeight: 260, borderRadius: 16, background: 'var(--raised)', display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: 13 }}>Pratinjau media (belum ada aset)</div>
                <strong>{review.title}</strong>
                <span className={p.muted}>{review.client} · {review.format}</span>
                <p className={p.muted} style={{ margin: 0 }}>Konten siap ditinjau. Publikasi dinonaktifkan sampai semua persetujuan selesai.</p>
                <div className={p.row}>
                  <Button size="sm" icon={<Check size={16} />} onClick={() => decide(review, true)}>Setujui</Button>
                  <Button size="sm" variant="secondary" icon={<RotateCcw size={16} />} onClick={() => decide(review, false)}>Minta Revisi</Button>
                </div>
              </motion.div>
            ) : (
              <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={p.muted}>Tidak ada konten yang menunggu approval.</motion.p>
            )}
          </AnimatePresence>
        </Panel>
      </div>
    </div>
  );
}
