'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { CalendarDays, Clapperboard, FolderKanban, Link2, MessageCircle, Send, Target, TrendingUp, Users } from 'lucide-react';
import { Avatar, DemoNote, FlowChevrons, KpiCard, PageHeader, Panel, StatusPill, osUi } from '../ui';
import { contentItems, integrations, projects, publishQueue, waSegments } from '@/fixtures/os.demo';
import { opsFlows } from '@/content/services';
import { bezier, inViewOnce } from '@/motion/tokens';
import p from '../pages.module.css';

const opsKpis = [
  { label: 'Produksi konten', value: 24, delta: 20, icon: <Clapperboard size={22} /> },
  { label: 'Publikasi', value: 48, delta: 33, icon: <Send size={22} /> },
  { label: 'Kampanye WA', value: 3, delta: 0, icon: <MessageCircle size={22} /> },
  { label: 'Total reach', value: 287400, delta: 41, icon: <TrendingUp size={22} /> },
  { label: 'Leads baru', value: 128, delta: 26, icon: <Users size={22} /> },
  { label: 'Konversi', value: 32, delta: 25, icon: <Target size={22} /> },
];
const asSteps = (arr: readonly string[]) => arr.map((label) => ({ label, decision: label.trim().endsWith('?') }));

/** Reference: "KILLUASURYA Agency OS Dashboard-4" (Dashboard Operasional). */
export function OperationsScreen() {
  return (
    <div className={p.stack}>
      <PageHeader title="Dashboard" highlight="Operasional" sub="Pantau produksi konten, publikasi lintas platform, dan kampanye WhatsApp dalam satu alur kerja terintegrasi." />
      <DemoNote>Angka dan status di halaman ini adalah contoh. Integrasi provider belum terhubung — tidak ada konten atau pesan yang benar-benar dikirim.</DemoNote>
      <div className={p.kpis6}>{opsKpis.map((k) => <KpiCard key={k.label} {...k} />)}</div>

      <div className={p.main2}>
        <div className={p.stack}>
          {opsFlows.slice(1).map((f) => (
            <Panel key={f.key} title={`Workflow: ${f.title}`} icon={<FolderKanban size={18} />}>
              <FlowChevrons steps={asSteps(f.steps)} label={f.title} />
              <p className={p.muted} style={{ margin: '8px 0 0', color: 'var(--coral-ink)' }}>{f.loop}</p>
            </Panel>
          ))}
        </div>
        <div className={p.stack}>
          <Panel title="Proyek Aktif" icon={<FolderKanban size={18} />} action={<Link href="/os/projects" className={p.muted}>Lihat semua</Link>}>
            <ul className={p.list}>
              {projects.map((pr) => (
                <li key={pr.id} style={{ display: 'grid', gap: 6, padding: '8px 4px' }}>
                  <div className={p.between}><span style={{ fontSize: 14, fontWeight: 600 }}>{pr.name}</span><span className={p.mono}>{pr.progress}%</span></div>
                  <div className={p.progress} role="progressbar" aria-label={pr.name} aria-valuenow={pr.progress} aria-valuemin={0} aria-valuemax={100}>
                    <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: pr.progress / 100 }} viewport={inViewOnce} transition={{ duration: 0.7, ease: bezier.out }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Integrasi & Status" icon={<Link2 size={18} />}>
            <ul className={p.list}>{integrations.slice(0, 5).map((i) => <li key={i.name} className={p.listItem} style={{ gridTemplateColumns: '1fr auto' }}><span>{i.name}<small>{i.desc}</small></span><StatusPill status={i.status} /></li>)}</ul>
          </Panel>
        </div>
      </div>

      <div className={p.g3} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))' }}>
        <Panel title="Produksi Konten (Aktif)" icon={<Clapperboard size={18} />} pad={false}>
          <div className={osUi.tableWrap} tabIndex={0} role="region" aria-label="Tabel (dapat digeser)"><table className={osUi.table}><thead><tr><th>Judul</th><th>PIC</th><th>Tahap</th><th>Status</th></tr></thead>
            <tbody>{contentItems.slice(0, 4).map((c) => <tr key={c.id}><td><strong>{c.title}</strong><div className={p.muted}>{c.client} · {c.format}</div></td><td><Avatar id={c.pic} /></td><td><span className={p.tag}>{c.stage}</span></td><td><StatusPill status={c.status} /></td></tr>)}</tbody></table></div>
        </Panel>
        <Panel title="Antrian Publikasi" icon={<Send size={18} />} pad={false}>
          <div className={osUi.tableWrap} tabIndex={0} role="region" aria-label="Tabel (dapat digeser)"><table className={osUi.table}><thead><tr><th>Konten</th><th>Platform</th><th>Status</th></tr></thead>
            <tbody>{publishQueue.slice(0, 4).map((q) => <tr key={q.id}><td><strong>{q.content}</strong><div className={p.muted}>{q.when}</div></td><td>{q.platform}</td><td><StatusPill status={q.status} /></td></tr>)}</tbody></table></div>
        </Panel>
        <Panel title="Kampanye WhatsApp (Consent)" icon={<CalendarDays size={18} />} pad={false}>
          <div className={osUi.tableWrap} tabIndex={0} role="region" aria-label="Tabel (dapat digeser)"><table className={osUi.table}><thead><tr><th>Segmen</th><th>Eligible</th><th>Dikecualikan</th></tr></thead>
            <tbody>{waSegments.map((w) => <tr key={w.name}><td><strong>{w.name}</strong></td><td className={p.mono}>{w.eligible}</td><td className={p.mono}>{w.excluded}</td></tr>)}</tbody></table></div>
        </Panel>
      </div>
    </div>
  );
}
