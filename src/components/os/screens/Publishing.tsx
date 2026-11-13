'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Send, ShieldCheck, Unplug } from 'lucide-react';
import { Button, useToast } from '@/components/motion';
import { DemoNote, FlowChevrons, PageHeader, Panel, StatusPill, osUi } from '../ui';
import { capability, publishQueue } from '@/fixtures/os.demo';
import { opsFlows } from '@/content/services';
import p from '../pages.module.css';

/** Visual preview of PRD §10B — no real Metricool/API call is made. */
export function PublishingScreen() {
  const toast = useToast();
  const [retrying, setRetrying] = useState<string | null>(null);
  const retry = (id: string) => {
    setRetrying(id);
    setTimeout(() => { setRetrying(null); toast({ tone: 'error', title: 'Retry tidak dijalankan', body: 'Provider belum terhubung. Lanjutkan melalui workflow manual (DATA DEMO).' }); }, 900);
  };
  return (
    <div className={p.stack}>
      <PageHeader title="Social Publishing" highlight="Control" sub="Pusat perencanaan & status lintas platform — bukan janji kontrol native seluruh fitur media sosial." />
      <DemoNote>Antrian ini contoh. Tidak ada konten yang dikirim ke platform mana pun.</DemoNote>
      <Panel title="Alur Publikasi (Control Flow)" icon={<Send size={18} />}>
        <FlowChevrons label="Alur social publishing" steps={opsFlows[2].steps.map((label) => ({ label, decision: label.endsWith('?') }))} />
        <p className={p.muted} style={{ margin: '8px 0 0', color: 'var(--coral-ink)' }}>{opsFlows[2].loop}</p>
      </Panel>
      <div className={p.main2}>
        <Panel title="Antrian Publikasi" icon={<Send size={18} />} pad={false}>
          <div className={osUi.tableWrap} tabIndex={0} role="region" aria-label="Tabel (dapat digeser)">
            <table className={osUi.table}>
              <thead><tr><th>Job</th><th>Platform</th><th>Jadwal</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>{publishQueue.map((q) => (
                <tr key={q.id}>
                  <td><strong>{q.content}</strong><div className={p.muted}>{q.id} · idempotency key (demo)</div></td>
                  <td>{q.platform}</td><td>{q.when}</td><td><StatusPill status={q.status} /></td>
                  <td>{q.status === 'FAILED' ? (
                    <Button size="sm" variant="secondary" loading={retrying === q.id} icon={<motion.span animate={retrying === q.id ? { rotate: 360 } : { rotate: 0 }} transition={{ repeat: retrying === q.id ? Infinity : 0, duration: 0.8, ease: 'linear' }} style={{ display: 'grid' }}><RefreshCw size={14} /></motion.span>} onClick={() => retry(q.id)}>Rekonsiliasi</Button>
                  ) : q.status === 'MANUAL_TASK' ? <span className={p.tag}>Publish manual</span> : <span className={p.muted}>—</span>}</td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className={p.stack}>
          <Panel title="Provider" icon={<Unplug size={18} />}>
            <div className={p.between}><strong>Metricool</strong><StatusPill status="Belum terhubung" /></div>
            <p className={p.muted} style={{ margin: '10px 0 0' }}>Data Metricool belum tersedia. Hasil terakhir: —. Periksa koneksi atau lanjutkan melalui workflow manual.</p>
          </Panel>
          <Panel title="Matriks Kemampuan Platform" icon={<ShieldCheck size={18} />}>
            <ul className={p.list}>{capability.map((c) => <li key={c.platform} className={p.listItem} style={{ gridTemplateColumns: '1fr auto' }}><span>{c.platform}<small>{c.note}</small></span><StatusPill status={c.support} /></li>)}</ul>
            <p className={p.muted} style={{ margin: '8px 0 0' }}>Kontrak desain — wajib cek ulang saat integrasi (PRD §10B.2).</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
