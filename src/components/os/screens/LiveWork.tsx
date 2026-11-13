'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AnimatedModal, Button, useToast } from '@/components/motion';
import { stageLabel, statuses } from '@/lib/workflow';
import { newProject, newProjectFromTemplate, quoteToProject, saveQuote, setMaterial, setProjectCompleted, setQuoteStatus, startProject } from '@/server/actions/tasks';
import { MaterialsPanel, NewProjectForm } from '../kit/ProjectKit';
import { uploadProjectFile } from '@/server/actions/files';
import type { ProjectCard, Quote } from '@/server/data';
import { EmptyState, PageHeader, Panel, osUi } from '../ui';
import s from './tasks.module.css';

const rp = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`;
const QSTATUS: Record<string, { label: string; tone: string }> = { draft: { label: 'Draft', tone: 'muted' }, awaiting_owner: { label: 'Menunggu Owner', tone: 'warn' }, sent: { label: 'Terkirim ke klien', tone: 'info' }, accepted: { label: 'Diterima', tone: 'good' }, revision: { label: 'Revisi', tone: 'warn' }, rejected: { label: 'Ditolak', tone: 'bad' } };

function useSave() {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const save = (job: () => Promise<{ ok: true } | { ok: false; error: string }>, ok: string, done?: () => void) =>
    start(async () => {
      const r = await job().catch(() => ({ ok: false as const, error: 'Terjadi gangguan. Coba lagi.' }));
      if (r.ok) { toast({ tone: 'success', title: ok }); done?.(); router.refresh(); } else toast({ tone: 'error', title: 'Tidak tersimpan', body: r.error });
    });
  return { pending, save };
}

type Draft = { id?: string; title: string; clientName: string; leadId: string; notes: string; items: { desc: string; qty: number; price: number }[] };
const blank: Draft = { title: '', clientName: '', leadId: '', notes: '', items: [{ desc: '', qty: 1, price: 0 }] };

/** Quotation & Proposal (live). Owner only. Total is recomputed on the server; items lock once the quotation is sent. */
export function QuotesLive({ owner, quotes, leads }: { owner: boolean; quotes: Quote[]; leads: { id: string; name: string }[] }) {
  const { pending, save } = useSave();
  const [d, setD] = useState<Draft | null>(null);
  const [confirm, setConfirm] = useState<Quote | null>(null);
  const total = (d?.items ?? []).reduce((n, i) => n + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const setItem = (k: number, patch: Partial<Draft['items'][number]>) => setD((x) => (x ? { ...x, items: x.items.map((it, i) => (i === k ? { ...it, ...patch } : it)) } : x));
  const valid = !!d && d.title.trim().length >= 2 && d.clientName.trim().length >= 2;

  if (!owner) return (<><PageHeader title="Quotation &" highlight="Proposal" /><Panel><EmptyState title="Khusus Owner" body="Penawaran harga hanya dapat dilihat dan disetujui oleh Owner." /></Panel></>);
  return (
    <>
      <PageHeader title="Quotation &" highlight="Proposal" sub="Susun penawaran, setujui, kirim ke klien, lalu ubah menjadi proyek saat diterima."
        actions={<Button size="sm" icon={<Plus size={18} aria-hidden="true" />} onClick={() => setD(blank)}>Penawaran baru</Button>} />
      <Panel title={`Penawaran (${quotes.length})`}>
        {quotes.length ? (
          <ul className={s.cards}>
            {quotes.map((q) => {
              const st = QSTATUS[q.status] ?? QSTATUS.draft;
              const editable = q.status === 'draft' || q.status === 'revision';
              return (
                <li key={q.id} className={s.card}>
                  <div className={s.cardHead}>
                    <div><strong>{q.title}</strong><br /><small>{q.clientName} · dibuat {q.createdAt}{q.sentAt ? ` · dikirim ${q.sentAt}` : ''}</small></div>
                    <span className={`${osUi.pill} ${osUi['t_' + st.tone]}`}><i aria-hidden="true" />{st.label}</span>
                  </div>
                  {q.items.length > 0 && <p>{q.items.map((i) => `${i.desc} (${i.qty} × ${rp(i.price)})`).join('\n')}</p>}
                  <p><strong style={{ color: 'var(--text)' }}>Total: {rp(q.total)}</strong>{q.notes ? ` · ${q.notes}` : ''}</p>
                  <div className={s.actions}>
                    {q.items.length > 0 && <Button size="sm" variant="secondary" href={`/api/quotations/${q.id}/pdf`} target="_blank" rel="noopener" {...{ prefetch: false }}>Unduh PDF</Button>}
                    {editable && <Button size="sm" variant="secondary" onClick={() => setD({ id: q.id, title: q.title, clientName: q.clientName, leadId: q.leadId ?? '', notes: q.notes, items: q.items.length ? q.items : blank.items })}>Ubah</Button>}
                    {editable && <Button size="sm" disabled={pending || !q.items.length} onClick={() => setConfirm(q)}>Setujui &amp; tandai terkirim</Button>}
                    {q.status === 'sent' && <>
                      <Button size="sm" disabled={pending} onClick={() => save(() => setQuoteStatus(q.id, 'accepted'), 'Ditandai diterima klien')}>Klien menerima</Button>
                      <Button size="sm" variant="secondary" disabled={pending} onClick={() => save(() => setQuoteStatus(q.id, 'revision'), 'Dikembalikan untuk revisi')}>Klien minta revisi</Button>
                      <Button size="sm" variant="secondary" disabled={pending} onClick={() => save(() => setQuoteStatus(q.id, 'rejected'), 'Ditandai ditolak')}>Ditolak</Button>
                    </>}
                    {q.status === 'accepted' && (q.projectId
                      ? <Button size="sm" variant="secondary" href="/os/projects">Lihat proyek</Button>
                      : <Button size="sm" disabled={pending} onClick={() => save(() => quoteToProject(q.id), 'Proyek dibuat dari penawaran')}>Buat proyek</Button>)}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : <EmptyState title="Belum ada penawaran" body="Buat penawaran pertama lewat tombol “Penawaran baru”." />}
        <p className={s.none} style={{ marginTop: 12 }}>Harga merupakan estimasi dan tidak mengikat sebelum penawaran final disetujui. Biaya pihak ketiga dicantumkan sebagai item terpisah.</p>
      </Panel>

      <AnimatedModal open={!!d} onClose={() => setD(null)} title={d?.id ? 'Ubah penawaran' : 'Penawaran baru'}>
        {d && (
          <form className={s.form} onSubmit={(e) => { e.preventDefault(); if (valid) save(() => saveQuote(d), 'Penawaran disimpan', () => setD(null)); }}>
            <label className={s.field}><span>Judul penawaran</span><input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} maxLength={160} /></label>
            <div className={s.two}>
              <label className={s.field}><span>Nama klien</span><input value={d.clientName} onChange={(e) => setD({ ...d, clientName: e.target.value })} maxLength={120} /></label>
              <label className={s.field}><span>Dari prospek (opsional)</span>
                <select className={s.sel} value={d.leadId} onChange={(e) => { const l = leads.find((x) => x.id === e.target.value); setD({ ...d, leadId: e.target.value, clientName: d.clientName || (l?.name ?? '') }); }}>
                  <option value="">—</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </label>
            </div>
            <fieldset className={s.items}>
              <legend>Item</legend>
              {d.items.map((it, k) => (
                <div key={k} className={s.item}>
                  <label className={s.field}><span>Deskripsi</span><input value={it.desc} onChange={(e) => setItem(k, { desc: e.target.value })} maxLength={200} /></label>
                  <label className={s.field}><span>Qty</span><input type="number" min={0} step="any" value={it.qty} onChange={(e) => setItem(k, { qty: Number(e.target.value) })} /></label>
                  <label className={s.field}><span>Harga (Rp)</span><input type="number" min={0} step="any" value={it.price} onChange={(e) => setItem(k, { price: Number(e.target.value) })} /></label>
                  <button type="button" className={s.del} aria-label={`Hapus item ${k + 1}`} disabled={d.items.length === 1} onClick={() => setD({ ...d, items: d.items.filter((_, i) => i !== k) })}><Trash2 size={16} aria-hidden="true" /></button>
                </div>
              ))}
              <Button type="button" size="sm" variant="secondary" onClick={() => setD({ ...d, items: [...d.items, { desc: '', qty: 1, price: 0 }] })}>+ Item</Button>
            </fieldset>
            <label className={s.field}><span>Catatan</span><input value={d.notes} onChange={(e) => setD({ ...d, notes: e.target.value })} maxLength={500} /></label>
            <p className={s.none}><strong style={{ color: 'var(--text)' }}>Perkiraan total: {rp(total)}</strong> (dihitung ulang di server)</p>
            <div className={s.actions}><Button type="submit" size="sm" loading={pending} disabled={!valid}>Simpan draft</Button><Button type="button" size="sm" variant="secondary" onClick={() => setD(null)}>Batal</Button></div>
          </form>
        )}
      </AnimatedModal>

      <AnimatedModal open={!!confirm} onClose={() => setConfirm(null)} title="Setujui penawaran?">
        {confirm && (
          <div className={s.form}>
            <p className={s.none} style={{ display: 'block' }}>&ldquo;{confirm.title}&rdquo; untuk {confirm.clientName} — total <strong style={{ color: 'var(--text)' }}>{rp(confirm.total)}</strong>. Setelah disetujui, item tidak bisa diubah kecuali klien meminta revisi. Pengiriman ke klien tetap Anda lakukan sendiri (WhatsApp/email).</p>
            <div className={s.actions}><Button size="sm" loading={pending} onClick={() => save(() => setQuoteStatus(confirm.id, 'sent'), 'Disetujui & ditandai terkirim', () => setConfirm(null))}>Ya, setujui</Button><Button size="sm" variant="secondary" onClick={() => setConfirm(null)}>Batal</Button></div>
          </div>
        )}
      </AnimatedModal>
    </>
  );
}

const COLS: { id: string; label: string; has: string[] }[] = [
  { id: 'todo', label: 'Siap / Menunggu', has: ['draft', 'waiting', 'ready', 'revision', 'blocked'] },
  { id: 'doing', label: 'Dikerjakan', has: ['progress'] },
  { id: 'review', label: 'Approval', has: ['review'] },
  { id: 'pub', label: 'Terjadwal / Terbit', has: ['approved', 'scheduled', 'published'] },
  { id: 'done', label: 'Selesai', has: ['completed'] },
];

/**
 * Proyek & Tugas (live): per-project board grouped by workflow status. Cards open the task in Tugas & Approval —
 * status changes happen there, through the server-validated workflow actions (no free drag between columns).
 */
export function ProjectsLive({ owner, people, projects, today }: { owner: boolean; people: Record<string, string>; projects: ProjectCard[]; today: string }) {
  const { pending, save } = useSave();
  const [add, setAdd] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const list = projects.filter((x) => showDone || !x.completed);
  return (
    <>
      <PageHeader title="Proyek &" highlight="Tugas" sub="Progres setiap proyek berdasarkan status tugas yang sebenarnya."
        actions={<>
          <label className={s.as}><input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} style={{ width: 18, height: 18 }} /><span>Tampilkan yang selesai</span></label>
          {owner && <Button size="sm" icon={<Plus size={18} aria-hidden="true" />} onClick={() => setAdd(true)}>Proyek baru</Button>}
        </>} />
      {list.length ? list.map((pr) => {
        const done = pr.tasks.filter((t) => t.status === 'completed').length;
        const pct = pr.tasks.length ? Math.round((done / pr.tasks.length) * 100) : 0;
        return (
          <Panel key={pr.id} id={`p-${pr.id}`} title={`${pr.client} · ${pr.name}`} action={owner ? <Button size="sm" variant="secondary" disabled={pending} onClick={() => save(() => setProjectCompleted(pr.id, !pr.completed), pr.completed ? 'Proyek dibuka kembali' : 'Proyek ditandai selesai')}>{pr.completed ? 'Buka kembali' : 'Tandai selesai'}</Button> : undefined}>
            {pr.template && pr.materials.length > 0 && !pr.completed && (
              <div style={{ marginBottom: 16 }}>
                <MaterialsPanel p={pr} who={owner ? 'owner' : 'staff'} today={today} pending={pending}
                  onSet={(id, st) => save(() => setMaterial(id, st), 'Status bahan diperbarui')}
                  onUpload={(id, f) => { const fd = new FormData(); fd.set('projectId', pr.id); fd.set('materialId', id); fd.set('file', f); save(() => uploadProjectFile(fd), `${f.name} terunggah — bahan ditandai Diterima`); }}
                  onStart={owner ? (d) => save(() => startProject(pr.id, d), 'Pengerjaan dimulai — deadline tugas sudah dihitung') : undefined} />
              </div>
            )}
            <div className={s.progressRow}><span className={s.bar} aria-hidden="true"><i style={{ width: `${pct}%` }} /></span><span className={s.loadNum}>{done}/{pr.tasks.length} tugas selesai · {pct}%</span></div>
            {pr.tasks.length ? (
              <div className={s.board} tabIndex={0} role="region" aria-label={`Board ${pr.name} (dapat digeser)`}>
                {COLS.map((col) => {
                  const items = pr.tasks.filter((t) => col.has.includes(t.status));
                  return (
                    <section key={col.id} className={s.col} aria-label={`${col.label}, ${items.length} tugas`}>
                      <h3 className={s.h3}>{col.label} ({items.length})</h3>
                      <ul className={s.list}>
                        {items.map((t) => {
                          const late = !!t.due && t.due < today && !['approved', 'published', 'completed'].includes(t.status);
                          const st = statuses[late ? 'overdue' : (t.status as keyof typeof statuses)] ?? statuses.draft;
                          return (
                            <li key={t.id}>
                              <Link href={`/os/tasks?task=${t.id}`} className={s.kcard}>
                                <strong>{t.title}</strong>
                                <small>{stageLabel(t.stage)} · {t.pic ? people[t.pic] ?? 'Anggota' : 'Belum ada PIC'}</small>
                                <span className={`${osUi.pill} ${osUi['t_' + st.tone]}`}><i aria-hidden="true" />{st.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
              </div>
            ) : <p className={s.none}>Belum ada tugas. Tambahkan dari Tugas &amp; Approval → Tugas baru.</p>}
          </Panel>
        );
      }) : <Panel><EmptyState title="Belum ada proyek" body={owner ? 'Buat proyek baru, atau ubah penawaran yang diterima menjadi proyek.' : 'Proyek tampil di sini setelah Anda mendapat tugas.'} /></Panel>}

      <AnimatedModal open={add} onClose={() => setAdd(false)} title="Proyek baru">
        <NewProjectForm today={today} pending={pending} onCancel={() => setAdd(false)}
          onSubmit={(v) => save(() => (v.template ? newProjectFromTemplate(v.client, v.project, v.template, v.materialsDue) : newProject(v.client, v.project)), 'Proyek dibuat', () => setAdd(false))} />
      </AnimatedModal>
    </>
  );
}
