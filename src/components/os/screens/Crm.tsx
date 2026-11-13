'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { ArrowDownUp, ChevronRight, Plus, ShieldCheck, ShieldX } from 'lucide-react';
import { AnimatedDrawer, AnimatedTabs, Button, useToast } from '@/components/motion';
import { Avatar, DemoNote, EmptyState, PageHeader, Panel, StatusPill, osUi } from '../ui';
import { leads as seed, leadStatuses, rupiah, type LeadStatus } from '@/fixtures/os.demo';
import { bezier, duration } from '@/motion/tokens';
import p from '../pages.module.css';

type Lead = (typeof seed)[number];
const pipelineCols: LeadStatus[] = ['NEW', 'REVIEWING', 'QUALIFIED', 'DISCOVERY', 'QUOTING', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON'];

export function CrmScreen() {
  const toast = useToast();
  const [rows, setRows] = useState<Lead[]>(seed);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [view, setView] = useState('table');
  const [sort, setSort] = useState<{ key: 'company' | 'value'; dir: 1 | -1 }>({ key: 'value', dir: -1 });
  const [open, setOpen] = useState<Lead | null>(null);

  const list = useMemo(() => rows
    .filter((l) => (status === 'ALL' || l.status === status) && (l.company + l.service + l.id).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort.key === 'value' ? (a.value - b.value) : a.company.localeCompare(b.company)) * sort.dir), [rows, q, status, sort]);

  const move = (l: Lead, to: LeadStatus) => {
    if (to === 'WON') { toast({ tone: 'info', title: 'WON butuh bukti kontrak', body: 'Sesuai PRD §08.2, status WON hanya setelah persetujuan kontrak terverifikasi (demo).' }); return; }
    setRows((r) => r.map((x) => (x.id === l.id ? { ...x, status: to } : x)));
    setOpen((o) => (o && o.id === l.id ? { ...o, status: to } : o));
    toast({ tone: 'success', title: `${l.company} → ${to}`, body: 'Perubahan hanya di pratinjau (DATA DEMO).' });
  };
  const sortBy = (key: 'company' | 'value') => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }));

  return (
    <div className={p.stack}>
      <PageHeader title="CRM &" highlight="Leads" sub="Lifecycle NEW → REVIEWING → QUALIFIED → DISCOVERY → QUOTING → PROPOSAL_SENT → NEGOTIATION → WON / LOST / NURTURE." actions={<Button href="/contact" icon={<Plus size={18} />}>Buat Lead</Button>} />
      <DemoNote>Lead di bawah ini fiktif. Perubahan status hanya tersimpan di pratinjau.</DemoNote>
      <Panel>
        <div className={p.toolbar}>
          <input className={p.searchInput} type="search" placeholder="Cari perusahaan, layanan, ID…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari lead" />
          <select className={p.select} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter status">
            <option value="ALL">Semua status</option>{leadStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div style={{ marginLeft: 'auto' }}><AnimatedTabs label="Tampilan CRM" value={view} onChange={setView} tabs={[{ id: 'table', label: 'Tabel' }, { id: 'pipeline', label: 'Pipeline' }]} /></div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: duration.toggle, ease: bezier.out }}>
            {!list.length ? <EmptyState title="Tidak ada lead" body="Ubah kata kunci atau filter status." /> : view === 'table' ? (
              <div className={osUi.tableWrap} tabIndex={0} role="region" aria-label="Tabel (dapat digeser)">
                <table className={osUi.table}>
                  <thead><tr>
                    <th aria-sort={sort.key === 'company' ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}><button type="button" className={osUi.sortBtn} onClick={() => sortBy('company')}>Perusahaan <ArrowDownUp size={14} aria-hidden="true" /></button></th>
                    <th>Layanan</th><th>Sumber</th><th>Status</th><th>Consent</th>
                    <th aria-sort={sort.key === 'value' ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}><button type="button" className={osUi.sortBtn} onClick={() => sortBy('value')}>Estimasi <ArrowDownUp size={14} aria-hidden="true" /></button></th>
                    <th>PIC</th><th><span className="sr-only">Detail</span></th>
                  </tr></thead>
                  <motion.tbody layout>
                    <AnimatePresence initial={false}>
                      {list.map((l) => (
                        <motion.tr key={l.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td><strong>{l.company}</strong><div className={p.muted}>{l.id} · {l.updated}</div></td>
                          <td>{l.service}</td><td>{l.source}</td><td><StatusPill status={l.status} /></td>
                          <td>{l.consent ? <span className={p.row} style={{ color: 'var(--success-ink)' }}><ShieldCheck size={16} aria-hidden="true" />Ya</span> : <span className={p.row} style={{ color: 'var(--coral-ink)' }}><ShieldX size={16} aria-hidden="true" />Tidak</span>}</td>
                          <td className={p.mono}>{rupiah(l.value)}</td><td><Avatar id={l.owner} /></td>
                          <td><button type="button" className={osUi.sortBtn} onClick={() => setOpen(l)} aria-label={`Detail ${l.company}`}><ChevronRight size={18} aria-hidden="true" /></button></td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </motion.tbody>
                </table>
              </div>
            ) : (
              <LayoutGroup>
                <div role="region" aria-label="Pipeline CRM (geser horizontal)" tabIndex={0} style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(210px, 1fr)', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
                  {pipelineCols.map((c, ci) => {
                    const items = list.filter((l) => l.status === c);
                    return (
                      <section key={c} aria-label={c} style={{ background: 'var(--raised)', borderRadius: 14, padding: 10, display: 'grid', gap: 8, alignContent: 'start', minHeight: 160 }}>
                        <div className={p.between}><StatusPill status={c} /><span className={p.tag}>{items.length}</span></div>
                        {items.map((l) => (
                          <motion.article key={l.id} layoutId={l.id} transition={{ duration: duration.modal, ease: bezier.out }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 10, fontSize: 13, display: 'grid', gap: 6 }}>
                            <button type="button" onClick={() => setOpen(l)} style={{ all: 'unset', cursor: 'pointer', fontWeight: 700 }}>{l.company}</button>
                            <span className={p.muted}>{l.service} · {rupiah(l.value)}</span>
                            <div className={p.row} style={{ gap: 6 }}>
                              {ci > 0 && <button type="button" className={p.tag} style={{ border: 0, cursor: 'pointer', minHeight: 32 }} onClick={() => move(l, pipelineCols[ci - 1])} ><span aria-hidden="true">← </span>Mundur<span className="sr-only"> {l.company} ke {pipelineCols[ci - 1]}</span></button>}
                              {ci < pipelineCols.length - 1 && <button type="button" className={p.tag} style={{ border: 0, cursor: 'pointer', minHeight: 32 }} onClick={() => move(l, pipelineCols[ci + 1])} >Maju<span className="sr-only"> {l.company} ke {pipelineCols[ci + 1]}</span><span aria-hidden="true"> →</span></button>}
                            </div>
                          </motion.article>
                        ))}
                      </section>
                    );
                  })}
                </div>
              </LayoutGroup>
            )}
          </motion.div>
        </AnimatePresence>
      </Panel>

      <AnimatedDrawer open={!!open} onClose={() => setOpen(null)} title={open ? `${open.company}` : 'Lead'}>
        {open && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div className={p.row}><StatusPill status={open.status} /><span className={p.tag}>{open.id}</span></div>
            <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 12px', margin: 0, fontSize: 14 }}>
              <dt className={p.muted}>Layanan</dt><dd style={{ margin: 0 }}>{open.service}</dd>
              <dt className={p.muted}>Sumber</dt><dd style={{ margin: 0 }}>{open.source}</dd>
              <dt className={p.muted}>Estimasi</dt><dd style={{ margin: 0 }}>{rupiah(open.value)}</dd>
              <dt className={p.muted}>Consent</dt><dd style={{ margin: 0 }}>{open.consent ? 'Ya — boleh dihubungi untuk inquiry' : 'Tidak ada — jangan masukkan ke kampanye'}</dd>
              <dt className={p.muted}>Next action</dt><dd style={{ margin: 0 }}>{open.next}</dd>
            </dl>
            <label className={p.muted} htmlFor="lead-status">Ubah status</label>
            <select id="lead-status" className={p.select} value={open.status} onChange={(e) => move(open, e.target.value as LeadStatus)}>{leadStatuses.map((s) => <option key={s}>{s}</option>)}</select>
            <Button href="/os/quotations" arrow>Buat Quotation</Button>
            <Link href="/os/whatsapp" className={p.muted}>Lihat aturan consent WhatsApp</Link>
          </div>
        )}
      </AnimatedDrawer>
    </div>
  );
}
