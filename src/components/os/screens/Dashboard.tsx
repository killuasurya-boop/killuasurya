'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, ArrowRight, BarChart3, CheckCircle2, FileText, FolderKanban, GitBranch, Layers, MessageCircle, PieChart, Target, TrendingUp, Users } from 'lucide-react';
import { AnimatedTabs } from '@/components/motion';
import { BarList, Donut, FlowChevrons, KpiCard, LineChart, Panel, StatusPill, DemoNote, osUi } from '../ui';
import { activity, DEMO_PERIOD, funnel, kpis, leadStages, leads, projectStatus, rupiah, topServices, trend } from '@/fixtures/os.demo';
import { bezier, duration } from '@/motion/tokens';
import p from '../pages.module.css';

const kpiIcons = { leads: <Users size={22} />, projects: <Target size={22} />, done: <CheckCircle2 size={22} />, pipeline: <Layers size={22} /> };
const actIcons = { check: CheckCircle2, project: FolderKanban, brief: FileText, wa: MessageCircle, report: BarChart3 };
const boardCols = ['NEW', 'REVIEWING', 'QUALIFIED', 'DISCOVERY', 'QUOTING', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON'] as const;

/** Reference: "KILLUASURYA.TECH Agency OS Dashboard-1" (Agency OS Lead-to-Project). */
export function DashboardScreen() {
  const [view, setView] = useState('kanban');
  return (
    <div className={p.stack}>
      <section className={p.hero} aria-labelledby="dash-title">
        <div>
          <h1 id="dash-title" className={`display ${p.heroTitle}`}>Agency OS <span>Lead-to-Project</span></h1>
          <p className={p.heroText}>Kelola seluruh perjalanan pelanggan, dari lead hingga proyek selesai, dalam satu sistem terintegrasi.</p>
        </div>
        <Image src="/assets/killuasurya/mascot/hero-thumbs-up.png" alt="" width={1600} height={1257} className={p.heroMascot} sizes="230px" priority />
      </section>
      <DemoNote>Periode {DEMO_PERIOD}. Semua angka adalah contoh untuk pratinjau UI — bukan data bisnis nyata.</DemoNote>

      <div className={p.kpis}>
        {kpis.map((k) => <KpiCard key={k.key} label={k.label} value={k.value} delta={k.delta} spark={k.spark} currency={'currency' in k} icon={kpiIcons[k.key]} />)}
      </div>

      <Panel title="Alur Lead-to-Project (End-to-End)" icon={<GitBranch size={18} />}>
        <FlowChevrons steps={leadStages} label="Alur Lead-to-Project" active={5} />
        <p className={p.muted} style={{ margin: '8px 0 0' }}>Client Accept? → Revisi kembali ke Discovery &amp; Estimate.</p>
      </Panel>

      <div className={p.main2}>
        <Panel title="Pipeline Lead & Proyek" icon={<Layers size={18} />} action={<AnimatedTabs label="Tampilan pipeline" value={view} onChange={setView} tabs={[{ id: 'kanban', label: 'Kanban' }, { id: 'table', label: 'Tabel' }]} />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: duration.toggle, ease: bezier.out }}>
              {view === 'kanban' ? (
                <div role="region" aria-label="Kanban pipeline (geser horizontal)" tabIndex={0} style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(190px, 1fr)', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                  {boardCols.map((c) => {
                    const items = leads.filter((l) => l.status === c);
                    return (
                      <div key={c} style={{ background: 'var(--raised)', borderRadius: 14, padding: 10, display: 'grid', gap: 8, alignContent: 'start' }}>
                        <div className={p.between}><StatusPill status={c} /><span className={p.tag}>{items.length}</span></div>
                        {items.map((l) => (
                          <motion.div key={l.id} whileHover={{ y: -2 }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 10, fontSize: 13 }}>
                            <strong style={{ display: 'block' }}>{l.company}</strong>
                            <span className={p.muted}>{l.service}</span>
                            <span className={p.muted} style={{ display: 'block' }}>{l.updated}</span>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={osUi.tableWrap} tabIndex={0} role="region" aria-label="Tabel (dapat digeser)">
                  <table className={osUi.table}>
                    <thead><tr><th>Lead</th><th>Layanan</th><th>Status</th><th>Estimasi</th></tr></thead>
                    <tbody>{leads.map((l) => <tr key={l.id}><td><strong>{l.company}</strong><div className={p.muted}>{l.id}</div></td><td>{l.service}</td><td><StatusPill status={l.status} /></td><td className={p.mono}>{rupiah(l.value)}</td></tr>)}</tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <Link href="/os/crm" className={p.row} style={{ marginTop: 12, color: 'var(--purple-ink)', fontWeight: 700, fontSize: 14, minHeight: 44 }}>Buka CRM <ArrowRight size={16} aria-hidden="true" /></Link>
        </Panel>

        <div className={p.stack}>
          <Panel title="Progress Proyek (Aktif)" icon={<PieChart size={18} />}>
            <Donut data={projectStatus} center="32" label="Proyek aktif" />
          </Panel>
          <Panel title="Aktivitas Terbaru" icon={<Activity size={18} />}>
            <ul className={p.list}>
              {activity.map((a) => { const I = actIcons[a.icon]; return (
                <li key={a.title} className={p.listItem}><span className={p.iconChip}><I size={18} aria-hidden="true" /></span><span>{a.title}<small>{a.meta}</small></span><small className={p.muted}>{a.time}</small></li>
              ); })}
            </ul>
          </Panel>
        </div>
      </div>

      <div className={p.g3}>
        <Panel title="Konversi Funnel (Lead → Proyek)" icon={<TrendingUp size={18} />}>
          <p style={{ margin: '0 0 12px' }}><strong style={{ fontSize: 28 }}>25%</strong> <span className={p.muted}>conversion rate (contoh)</span></p>
          <BarList data={funnel} />
        </Panel>
        <Panel title="Tren Leads & Deal (30 hari)" icon={<TrendingUp size={18} />}>
          <LineChart label="Tren leads dan deal 30 hari (data demo)" labels={trend.labels} series={trend.series} height={200} />
        </Panel>
        <Panel title="Layanan Paling Diminati" icon={<BarChart3 size={18} />}>
          <BarList data={topServices} unit="%" max={40} />
        </Panel>
      </div>
    </div>
  );
}
