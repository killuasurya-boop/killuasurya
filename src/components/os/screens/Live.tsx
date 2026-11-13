'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ExternalLink, MessageCircle, ThumbsUp } from 'lucide-react';
import { Button, useToast } from '@/components/motion';
import { roleLabels, stageLabel, statuses } from '@/lib/workflow';
import { clientDecide, markMaterialSent, updateLead, updateMember } from '@/server/actions/tasks';
import { MaterialsPanel } from '../kit/ProjectKit';
import { kitState } from '@/lib/templates';
import { uploadProjectFile } from '@/server/actions/files';
import type { Lead, Member, PortalData } from '@/server/data';
import { EmptyState, PageHeader, Panel, osUi } from '../ui';
import s from './tasks.module.css';

const LEAD: [string, string][] = [['new', 'New Lead'], ['contacted', 'Contacted'], ['qualified', 'Qualified'], ['consultation', 'Consultation'], ['proposal', 'Proposal'], ['negotiation', 'Negotiation'], ['won', 'Won'], ['lost', 'Lost']];

function useSave() {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const save = (job: () => Promise<{ ok: true } | { ok: false; error: string }>, ok: string) =>
    start(async () => {
      const r = await job().catch(() => ({ ok: false as const, error: 'Terjadi gangguan. Coba lagi.' }));
      if (r.ok) { toast({ tone: 'success', title: ok }); router.refresh(); } else toast({ tone: 'error', title: 'Tidak tersimpan', body: r.error });
    });
  return { pending, save };
}

/** CRM (live): leads sent from the website's Smart Brief. Owner only — the database returns nothing to other roles. */
export function LeadsLive({ owner, leads }: { owner: boolean; leads: Lead[] }) {
  const { pending, save } = useSave();
  const [filter, setFilter] = useState('all');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const shown = filter === 'all' ? leads : leads.filter((l) => l.status === filter);
  const wa = (c: string) => { const d = c.replace(/\D/g, '').replace(/^0/, '62'); return d.length >= 9 ? `https://wa.me/${d}` : null; };
  return (
    <>
      <PageHeader title="CRM &" highlight="Leads" sub="Prospek dari Smart Brief di website. Status dan catatan tersimpan di server." />
      {!owner ? <Panel><EmptyState title="Khusus Owner" body="Data prospek hanya dapat dilihat oleh Owner." /></Panel> : (
        <Panel title={`Prospek (${shown.length})`} action={
          <label className={s.as}><span>Status</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Semua</option>{LEAD.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select>
          </label>}>
          {shown.length ? (
            <ul className={s.cards}>
              {shown.map((l) => {
                const link = wa(l.contact);
                return (
                  <li key={l.id} className={s.card}>
                    <div className={s.cardHead}>
                      <div><strong>{l.name}</strong><br /><small>{l.contact}{l.business ? ` · ${l.business}` : ''} · {l.createdAt}</small></div>
                      {link && <Button href={link} target="_blank" rel="noopener noreferrer" size="sm" variant="secondary" icon={<MessageCircle size={16} aria-hidden="true" />}>WhatsApp</Button>}
                    </div>
                    {(l.services.length > 0 || l.packageCode || l.budget) && <p>{[l.services.join(', '), l.packageCode && `Paket ${l.packageCode}`, l.budget && `Budget: ${l.budget}`].filter(Boolean).join(' · ')}</p>}
                    {l.needs && <p>{l.needs}</p>}
                    <div className={s.controls}>
                      <label className={s.field}><span>Status</span>
                        <select className={s.sel} value={l.status} disabled={pending} onChange={(e) => save(() => updateLead(l.id, { status: e.target.value }), 'Status diperbarui')}>{LEAD.map(([id, x]) => <option key={id} value={id}>{x}</option>)}</select>
                      </label>
                      <label className={s.field}><span>Follow-up</span><input type="date" defaultValue={l.followUp ?? ''} disabled={pending} onChange={(e) => save(() => updateLead(l.id, { followUp: e.target.value || null }), 'Follow-up disimpan')} /></label>
                      <label className={s.field} style={{ flexBasis: '100%' }}><span>Catatan konsultasi</span><textarea rows={2} value={notes[l.id] ?? l.notes} onChange={(e) => setNotes((n) => ({ ...n, [l.id]: e.target.value }))} /></label>
                      {notes[l.id] !== undefined && notes[l.id] !== l.notes && <Button size="sm" loading={pending} onClick={() => save(() => updateLead(l.id, { notes: notes[l.id] }), 'Catatan disimpan')}>Simpan catatan</Button>}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <EmptyState title="Belum ada prospek" body="Prospek muncul di sini setelah pengunjung mengirim Smart Brief di website." />}
        </Panel>
      )}
    </>
  );
}

/** Tim & Akses (live): the Owner sets each member's role and can deactivate access. New members are invited from the Supabase dashboard. */
export function TeamLive({ owner, meId, members }: { owner: boolean; meId: string; members: Member[] }) {
  const { pending, save } = useSave();
  return (
    <>
      <PageHeader title="Tim &" highlight="Akses" sub="Peran menentukan apa yang bisa dilihat dan dilakukan. Perubahan dicatat di audit log." />
      <Panel title={`Anggota (${members.length})`}>
        <ul className={s.cards}>
          {members.map((m) => (
            <li key={m.id} className={s.card}>
              <div className={s.cardHead}>
                <div><strong>{m.name}</strong>{m.id === meId && <small> · Anda</small>}<br /><small>{roleLabels[m.role] ?? m.role}{m.active ? '' : ' · nonaktif'}</small></div>
                {owner && m.id !== meId && (
                  <div className={s.controls}>
                    <label className={s.field}><span>Peran</span>
                      <select className={s.sel} value={m.role} disabled={pending} onChange={(e) => save(() => updateMember(m.id, { role: e.target.value }), 'Peran diperbarui')}>{Object.entries(roleLabels).map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select>
                    </label>
                    <Button size="sm" variant="secondary" disabled={pending} onClick={() => save(() => updateMember(m.id, { active: !m.active }), m.active ? 'Akses dinonaktifkan' : 'Akses diaktifkan')}>{m.active ? 'Nonaktifkan' : 'Aktifkan'}</Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className={s.none} style={{ marginTop: 12 }}>{owner ? 'Anggota baru diundang lewat Supabase → Authentication → Invite, lalu atur perannya di sini. Akun baru selalu mulai sebagai Klien (akses paling terbatas).' : 'Hanya Owner yang dapat mengubah peran.'}</p>
      </Panel>
    </>
  );
}

/** Client portal (live): only this client's projects; no internal comments, files or history. */

type PTask = PortalData['projects'][number]['tasks'][number];
/** Portal: one card per item waiting for the client's decision — open preview, approve, or ask for a revision. */
function ApprovalCard({ t, project, pending, save }: { t: PTask; project: string; pending: boolean; save: ReturnType<typeof useSave>['save'] }) {
  const [mode, setMode] = useState<'idle' | 'revise'>('idle');
  const [note, setNote] = useState('');
  return (
    <li className={s.card} aria-label={`Persetujuan: ${t.title}`}>
      <span className={s.rowMain}><strong>{t.title}</strong><small>{project}{t.client_rounds ? ` · sudah ${t.client_rounds}x revisi` : ''}</small></span>
      {t.preview_url && <a href={t.preview_url} target="_blank" rel="noopener noreferrer" className={s.prevLink}><ExternalLink size={16} aria-hidden="true" /> Buka pratinjau</a>}
      {mode === 'idle' ? (
        <div className={s.actions}>
          <Button size="sm" icon={<ThumbsUp size={16} aria-hidden="true" />} disabled={pending} onClick={() => save(() => clientDecide(t.id, 'approve', ''), 'Terima kasih, persetujuan tercatat')}>Setujui</Button>
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => setMode('revise')}>Minta revisi</Button>
        </div>
      ) : (
        <form className={s.form} style={{ marginTop: 0 }} onSubmit={(e) => { e.preventDefault(); save(() => clientDecide(t.id, 'revise', note), 'Permintaan revisi terkirim'); }}>
          <label className={s.field}><span>Bagian mana yang perlu diubah? Tulis semua dalam satu pesan.</span><textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} required /></label>
          <div className={s.actions}><Button type="submit" size="sm" loading={pending} disabled={note.trim().length < 5}>Kirim permintaan revisi</Button><Button type="button" size="sm" variant="secondary" onClick={() => setMode('idle')}>Batal</Button></div>
        </form>
      )}
    </li>
  );
}

export function PortalLive({ data }: { data: PortalData }) {
  const { pending, save } = useSave();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  return (
    <>
      <PageHeader title="Portal" highlight="Klien" sub={`Halo, ${data.name}. Berikut progres proyek Anda.`} />
      {(() => {
        const waiting = data.projects.flatMap((p) => p.tasks.filter((t) => t.stage === 'client' && t.status === 'review').map((t) => ({ t, project: p.name })));
        return waiting.length ? (
          <Panel title={`Perlu persetujuan Anda (${waiting.length})`}>
            <ul className={s.cards}>{waiting.map(({ t, project }) => <ApprovalCard key={t.id} t={t} project={project} pending={pending} save={save} />)}</ul>
          </Panel>
        ) : null;
      })()}
      {data.projects.length ? data.projects.map((p) => {
        const done = p.tasks.filter((t) => ['published', 'completed', 'approved'].includes(t.status)).length;
        return (
          <Panel key={p.id} title={`${p.name} · ${done}/${p.tasks.length} selesai`}>
            {p.template && p.materials.length > 0 && (!p.startDate || kitState(p.materials).missing.length > 0) && (
              <div style={{ marginBottom: 16 }}>
                <MaterialsPanel p={p} who="client" today={today} pending={pending} onSent={(id, note) => save(() => markMaterialSent(id, note), 'Terima kasih — tim kami akan mengecek')}
                  onUpload={(id, f) => { const fd = new FormData(); fd.set('projectId', p.id); fd.set('materialId', id); fd.set('file', f); save(() => uploadProjectFile(fd), `${f.name} terunggah — terima kasih!`); }} />
              </div>
            )}
            {p.tasks.length ? (
              <ul className={s.list}>
                {p.tasks.map((t) => {
                  const st = statuses[t.status as keyof typeof statuses] ?? statuses.draft;
                  return <li key={t.id} className={s.row} style={{ cursor: 'default' }}><span className={s.rowMain}><strong>{t.title}</strong><small>{stageLabel(t.stage)}{t.due ? ` · target ${new Date(`${t.due}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}` : ''}</small></span><span className={`${osUi.pill} ${osUi['t_' + st.tone]}`}><i aria-hidden="true" />{st.label}</span></li>;
                })}
              </ul>
            ) : <EmptyState title="Belum ada pekerjaan" body="Pekerjaan akan tampil di sini setelah proyek dimulai." />}
          </Panel>
        );
      }) : <Panel><EmptyState title="Belum ada proyek" body="Akun Anda belum terhubung ke proyek. Hubungi tim kami lewat WhatsApp." /></Panel>}
      {data.quotes.length > 0 && (
        <Panel title="Penawaran">
          <ul className={s.list}>
            {data.quotes.map((q) => (
              <li key={q.id} className={s.row} style={{ cursor: 'default' }}>
                <span className={s.rowMain}><strong>{q.title}</strong><small>{'Rp ' + q.total.toLocaleString('id-ID')} · {q.status === 'accepted' ? 'Diterima' : q.status === 'revision' ? 'Sedang direvisi' : 'Menunggu jawaban Anda'}</small></span>
                <Button size="sm" variant="secondary" href={`/api/quotations/${q.id}/pdf`} target="_blank" rel="noopener" {...{ prefetch: false }}>Unduh PDF</Button>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
