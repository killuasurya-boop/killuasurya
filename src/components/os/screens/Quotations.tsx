'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Download, FileText, Plus, ShieldCheck } from 'lucide-react';
import { AnimatedModal, Button, useToast } from '@/components/motion';
import { DemoNote, PageHeader, Panel, StatusPill, osUi } from '../ui';
import { quotations as seed, quoteFlow, rupiah } from '@/fixtures/os.demo';
import { quotationDisclaimer } from '@/content/services';
import { bezier, duration } from '@/motion/tokens';
import p from '../pages.module.css';

type Q = (typeof seed)[number];

export function QuotationsScreen() {
  const toast = useToast();
  const [rows, setRows] = useState<Q[]>(seed);
  const [sel, setSel] = useState(seed[0].id);
  const [confirm, setConfirm] = useState(false);
  const q = rows.find((r) => r.id === sel)!;
  const step = Math.max(0, quoteFlow.indexOf(q.status as (typeof quoteFlow)[number]));
  const total = q.items.reduce((a, [, n, v]) => a + n * v, 0);

  const approve = () => {
    setRows((r) => r.map((x) => (x.id === q.id ? { ...x, status: 'APPROVED' } : x)));
    setConfirm(false);
    toast({ tone: 'success', title: `${q.id} disetujui (demo)`, body: 'Pada produksi, persetujuan Owner tercatat dengan waktu, versi, dan audit trail.' });
  };

  return (
    <div className={p.stack}>
      <PageHeader title="Quotation &" highlight="Approval" sub="Estimate → DRAFT → INTERNAL_REVIEW → APPROVED → SENT → VIEWED → ACCEPTED / REVISE / DECLINED / EXPIRED." actions={<Button icon={<Plus size={18} />} onClick={() => toast({ tone: 'info', title: 'Builder quotation', body: 'Formulir quotation lengkap tersedia setelah rate card Owner (D-05).' })}>Buat Quotation</Button>} />
      <DemoNote>Nilai quotation di bawah ini contoh. {quotationDisclaimer}</DemoNote>
      <div className={p.split}>
        <Panel title="Daftar Quotation" icon={<FileText size={18} />} pad={false}>
          <div className={osUi.tableWrap} tabIndex={0} role="region" aria-label="Tabel (dapat digeser)">
            <table className={osUi.table}>
              <thead><tr><th>No.</th><th>Klien</th><th>Nilai</th><th>Status</th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.id} aria-selected={r.id === sel} style={r.id === sel ? { background: 'var(--raised)', boxShadow: 'inset 3px 0 0 var(--lime)' } : undefined}>
                  <td><button type="button" className={osUi.sortBtn} onClick={() => setSel(r.id)}>{r.id}</button><div className={p.muted}>v{r.version}</div></td>
                  <td>{r.client}<div className={p.muted}>{r.title}</div></td>
                  <td className={p.mono}>{rupiah(r.amount)}</td><td><StatusPill status={r.status} /></td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </Panel>

        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: duration.toggle, ease: bezier.out }}>
            <Panel title={`${q.id} · ${q.client}`} icon={<FileText size={18} />} action={<StatusPill status={q.status} />}>
              <ol aria-label="Status quotation" tabIndex={0} style={{ listStyle: 'none', margin: '0 0 16px', padding: 0, display: 'grid', gridTemplateColumns: `repeat(${quoteFlow.length}, minmax(52px, 1fr))`, gap: 4, overflowX: 'auto' }}>
                {quoteFlow.map((f, i) => (
                  <li key={f} style={{ display: 'grid', gap: 6, justifyItems: 'center', fontSize: 11, color: i <= step ? 'var(--text)' : 'var(--muted)', textAlign: 'center' }}>
                    <motion.span animate={{ scale: i === step ? 1.12 : 1 }} style={{ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', background: i < step ? 'var(--purple)' : i === step ? 'var(--lime)' : 'var(--raised)', color: i < step ? '#fff' : 'var(--on-lime)' }}>{i < step ? <Check size={14} aria-hidden="true" /> : i + 1}</motion.span>
                    {f.replace('_', ' ')}
                  </li>
                ))}
              </ol>
              <p style={{ margin: '0 0 8px', fontWeight: 700 }}>{q.title}</p>
              <div className={osUi.tableWrap} tabIndex={0} role="region" aria-label="Tabel (dapat digeser)">
                <table className={osUi.table}>
                  <thead><tr><th>Item</th><th>Qty</th><th>Harga satuan</th><th>Subtotal</th></tr></thead>
                  <tbody>{q.items.map(([name, n, v]) => <tr key={name}><td>{name}</td><td>{n}</td><td className={p.mono}>{rupiah(v)}</td><td className={p.mono}>{rupiah(n * v)}</td></tr>)}</tbody>
                  <tfoot><tr><td colSpan={3} style={{ padding: '12px 14px', fontWeight: 700 }}>Total (sebelum pajak & biaya pihak ketiga)</td><td className={p.mono} style={{ padding: '12px 14px', fontWeight: 800 }}>{rupiah(total)}</td></tr></tfoot>
                </table>
              </div>
              <p className={p.muted} style={{ margin: '12px 0' }}>Berlaku sampai: {q.valid} · Versi {q.version}</p>
              <div className={p.row}>
                <Button icon={<ShieldCheck size={18} />} onClick={() => setConfirm(true)} disabled={q.status !== 'INTERNAL_REVIEW' && q.status !== 'DRAFT'}>Approval Owner</Button>
                <Button variant="secondary" icon={<Download size={18} />} href={`/api/quotations/${q.id}/pdf`} target="_blank" rel="noopener" {...{ prefetch: false }}>Unduh PDF</Button>
              </div>
            </Panel>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatedModal open={confirm} onClose={() => setConfirm(false)} title={`Setujui ${q.id}?`}>
        <p style={{ margin: '0 0 16px', color: 'var(--muted)' }}>Total {rupiah(total)} untuk {q.client}. Setelah disetujui, quotation dapat dikirim ke klien. {quotationDisclaimer}</p>
        <div className={p.row} style={{ justifyContent: 'flex-end' }}>
          <Button variant="tertiary" onClick={() => setConfirm(false)}>Batal</Button>
          <Button onClick={approve} arrow>Setujui (demo)</Button>
        </div>
      </AnimatedModal>
    </div>
  );
}
