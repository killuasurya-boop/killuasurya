'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, FileText, Flag, LogOut, Receipt } from 'lucide-react';
import { Button, ToastProvider, useToast } from '@/components/motion';
import { DemoNote, PageHeader, Panel } from '../ui';
import { portal } from '@/fixtures/os.demo';
import { bezier, stagger } from '@/motion/tokens';
import { KitDemo } from '../kit/KitDemo';
import p from '../pages.module.css';

function PortalBody() {
  const toast = useToast();
  const [items, setItems] = useState(portal.deliverables);
  const done = portal.milestones.filter((m) => m.status === 'done').length;
  const pct = Math.round(((done + 0.5) / portal.milestones.length) * 100);
  return (
    <div className={p.stack}>
      <PageHeader title="Portal" highlight="Klien" sub={`${portal.client} · ${portal.project}. Anda hanya melihat data proyek milik Anda.`} />
      <DemoNote>Portal klien pratinjau — invite-only, belum terhubung ke backend.</DemoNote>
      <KitDemo who="client" />
      <div className={p.main2}>
        <Panel title="Milestone Proyek" icon={<Flag size={18} />}>
          <div className={p.between} style={{ marginBottom: 12 }}><span className={p.muted}>Progres berbasis milestone yang diterima</span><strong>{pct}%</strong></div>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative', display: 'grid', gap: 14 }}>
            <motion.span aria-hidden="true" style={{ position: 'absolute', left: 15, top: 8, bottom: 8, width: 3, background: 'var(--purple)', transformOrigin: 'top', borderRadius: 2 }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.9, ease: bezier.out }} />
            {portal.milestones.map((m, i) => (
              <motion.li key={m.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * stagger.card }} style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', background: m.status === 'done' ? 'var(--purple)' : m.status === 'current' ? 'var(--lime)' : 'var(--raised)', color: m.status === 'done' ? '#fff' : 'var(--on-lime)', fontWeight: 800, fontSize: 13, zIndex: 1 }}>{m.status === 'done' ? <Check size={16} aria-hidden="true" /> : i + 1}</span>
                <span><strong>{m.label}</strong><br /><small className={p.muted}>{m.status === 'done' ? 'Selesai' : m.status === 'current' ? 'Sedang berjalan' : 'Belum dimulai'}</small></span>
              </motion.li>
            ))}
          </ol>
        </Panel>
        <div className={p.stack}>
          <Panel title="Deliverable & Approval" icon={<FileText size={18} />}>
            <ul className={p.list}>{items.map((d) => (
              <li key={d.name} className={p.listItem} style={{ gridTemplateColumns: '1fr auto' }}>
                <span>{d.name}<small>{d.status}</small></span>
                {d.status.startsWith('Menunggu') ? <Button size="sm" onClick={() => { setItems((l) => l.map((x) => (x.name === d.name ? { ...x, status: 'Disetujui (demo)' } : x))); toast({ tone: 'success', title: 'Approval tercatat (demo)', body: d.name }); }}>Setujui</Button> : <span className={p.tag}>{d.status}</span>}
              </li>))}
            </ul>
          </Panel>
          <Panel title="Invoice" icon={<Receipt size={18} />}>
            <ul className={p.list}>{portal.invoices.map((iv) => <li key={iv.id} className={p.listItem} style={{ gridTemplateColumns: '1fr auto' }}><span>{iv.label}<small>{iv.id}</small></span><span className={p.tag}>{iv.status}</span></li>)}</ul>
            <p className={p.muted} style={{ margin: '8px 0 0' }}>Pembayaran tidak dianggap berhasil dari unggahan bukti semata.</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export function PortalScreen({ children, onSignOut }: { children?: React.ReactNode; onSignOut?: () => Promise<void> } = {}) {
  return (
    <ToastProvider>
      <header style={{ position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 24px', borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--bg) 88%, transparent)', backdropFilter: 'blur(10px)' }}>
        <Link href="/portal" aria-label="Portal Klien"><Image src="/assets/killuasurya/brand/logo-killuasurya-tech.png" alt="KILLUASURYA.TECH" width={1597} height={506} style={{ height: 48, width: 'auto' }} priority /></Link>
        {onSignOut
          ? <form action={onSignOut}><button type="submit" className={p.row} style={{ minHeight: 44, fontWeight: 600, fontSize: 14, background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}><LogOut size={18} aria-hidden="true" /> Keluar</button></form>
          : <Link href="/client/login" className={p.row} style={{ minHeight: 44, fontWeight: 600, fontSize: 14 }}><LogOut size={18} aria-hidden="true" /> Keluar</Link>}
      </header>
      <main id="main" className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>{children ?? <PortalBody />}</main>
    </ToastProvider>
  );
}
