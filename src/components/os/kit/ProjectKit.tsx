'use client';

import { useState } from 'react';
import { CalendarClock, CheckCircle2, Copy, Hourglass, MessageCircle, PackageOpen, Paperclip, Play, ShieldAlert, Upload } from 'lucide-react';
import { Button, useToast } from '@/components/motion';
import { MAX_UPLOAD, daysBetween, dueFor, fmtDate, fmtSize, kitState, materialStatus, reminderText, roleName, templateById, templates, type Material, type MaterialStatus } from '@/lib/templates';
import { osUi } from '../ui';
import k from './kit.module.css';

export type KitProject = { id: string; name: string; client: string; template: string | null; materialsDue: string | null; startDate: string | null; materials: Material[] };
type Who = 'owner' | 'staff' | 'client';

/** Clock banner: has the N-day clock started, and if not, what is it waiting for. */
function Clock({ p, today, who }: { p: KitProject; today: string; who: Who }) {
  const tpl = templateById(p.template);
  const st = kitState(p.materials);
  const days = tpl?.workdays ?? 0;
  if (p.startDate) {
    const end = dueFor(p.startDate, days);
    return <p className={`${k.clock} ${k.run}`}><Play size={18} aria-hidden="true" /><span><strong>Pengerjaan berjalan</strong> sejak {fmtDate(p.startDate)} · target tayang {fmtDate(end)}</span></p>;
  }
  const late = p.materialsDue ? daysBetween(p.materialsDue, today) : null;
  return (
    <p className={`${k.clock} ${late !== null && late > 0 ? k.late : k.wait}`} role="status">
      <Hourglass size={18} aria-hidden="true" />
      <span>
        <strong>{st.ready ? 'Bahan wajib lengkap — siap mulai' : `Jam ${days} hari kerja belum berjalan`}</strong>
        {!st.ready && <> · menunggu {st.reqTotal - st.reqReady} bahan wajib{who === 'client' ? ' dari Anda' : ' dari klien'}</>}
        {p.materialsDue && !st.ready && <> · tenggat bahan {fmtDate(p.materialsDue)}{late !== null && late > 0 ? <em> (lewat {late} hari)</em> : late === 0 ? <em> (hari ini)</em> : ` (${-late!} hari lagi)`}</>}
      </span>
    </p>
  );
}

function Item({ m, who, pending, onSet, onSent, onUpload }: { m: Material; who: Who; pending?: boolean; onSet?: (s: MaterialStatus) => void; onSent?: (note: string) => void; onUpload?: (f: File) => void }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const st = materialStatus[m.status];
  return (
    <li className={`${k.item} ${m.status === 'received' || m.status === 'fallback' ? k.ok : ''}`}>
      <div className={k.itemMain}>
        <span className={k.label}>{m.label}{m.required ? <b className={k.req}>wajib</b> : <span className={k.opt}>opsional</span>}</span>
        <small className={k.detail}>{m.detail}</small>
        {m.fallback && who !== 'client' && m.status !== 'received' && <small className={k.planB}><strong>Rencana B:</strong> {m.fallback}</small>}
        {m.fallback && who === 'client' && m.status === 'missing' && <small className={k.planB}>Belum ada? {m.fallback}</small>}
        {m.note && <small className={k.note}>Catatan: {m.note}</small>}
        {!!m.files?.length && (
          <ul className={k.files} aria-label={`File untuk ${m.label}`}>
            {m.files.map((f) => <li key={f.id}><Paperclip size={14} aria-hidden="true" />{f.id.startsWith('demo-') ? <span>{f.name}</span> : <a href={`/api/files/${f.id}`} target="_blank" rel="noopener">{f.name}</a>}<small>{fmtSize(f.size)}</small></li>)}
          </ul>
        )}
      </div>
      <div className={k.itemAct}>
        <span className={`${osUi.pill} ${osUi['t_' + st.tone]}`}><i aria-hidden="true" />{who === 'client' && m.status === 'sent' ? 'Terkirim, menunggu dicek' : st.label}</span>
        {who !== 'client' && onSet && m.status !== 'received' && <Button size="sm" disabled={pending} onClick={() => onSet('received')}>Diterima</Button>}
        {who === 'owner' && onSet && m.fallback && m.status !== 'received' && m.status !== 'fallback' && <Button size="sm" variant="secondary" disabled={pending} onClick={() => onSet('fallback')}>Pakai Rencana B</Button>}
        {who !== 'client' && onSet && m.status !== 'missing' && <button type="button" className={k.undo} disabled={pending} onClick={() => onSet('missing')}>Batalkan</button>}
        {onUpload && m.status !== 'received' && m.status !== 'fallback' && (
          <label className={`${k.upload} ${pending ? k.busy : ''}`}>
            <Upload size={16} aria-hidden="true" /><span>Unggah file</span>
            <input type="file" disabled={pending} aria-label={`Unggah file untuk ${m.label}`} onChange={(e) => {
              const f = e.target.files?.[0]; e.target.value = '';
              if (!f) return;
              if (f.size > MAX_UPLOAD) { toast({ tone: 'error', title: 'File terlalu besar', body: 'Maksimal 20 MB. Untuk file besar, kirim link Google Drive.' }); return; }
              onUpload(f);
            }} />
          </label>
        )}
        {who === 'client' && onSent && m.status === 'missing' && !open && <Button size="sm" variant={onUpload ? 'secondary' : 'primary'} disabled={pending} onClick={() => setOpen(true)}>{onUpload ? 'Kirim lewat WA/Drive' : 'Sudah saya kirim'}</Button>}
      </div>
      {open && (
        <form className={k.sent} onSubmit={(e) => { e.preventDefault(); onSent?.(note); setOpen(false); }}>
          <label><span>Catatan atau link Google Drive (opsional)</span><input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="mis. dikirim lewat WA tadi siang" /></label>
          <div className={k.row}><Button type="submit" size="sm" loading={pending}>Kirim</Button><Button type="button" size="sm" variant="secondary" onClick={() => setOpen(false)}>Batal</Button></div>
        </form>
      )}
    </li>
  );
}

/** Materials checklist + reminder + start button. Used by Owner/staff (Proyek), the client (Portal) and in demo mode. */
export function MaterialsPanel({ p, who, today, pending, onSet, onSent, onStart, onUpload }: {
  p: KitProject; who: Who; today: string; pending?: boolean;
  onSet?: (id: string, s: MaterialStatus) => void; onSent?: (id: string, note: string) => void; onStart?: (date: string) => void; onUpload?: (id: string, f: File) => void;
}) {
  const toast = useToast();
  const tpl = templateById(p.template);
  const st = kitState(p.materials);
  const [start, setStart] = useState(today);
  const msg = tpl ? reminderText({ client: p.client, name: p.name, materialsDue: p.materialsDue, workdays: tpl.workdays }, p.materials) : '';
  const copy = async () => {
    try { await navigator.clipboard.writeText(msg); toast({ tone: 'success', title: 'Pesan pengingat disalin', body: 'Tempel di chat WhatsApp klien.' }); }
    catch { toast({ tone: 'error', title: 'Tidak bisa menyalin', body: 'Gunakan tombol WhatsApp.' }); }
  };
  const sorted = [...p.materials].sort((a, b) => Number(b.required) - Number(a.required));
  return (
    <div className={k.kit}>
      <Clock p={p} today={today} who={who} />
      <div className={k.head}>
        <h3 className={k.h3}><PackageOpen size={18} aria-hidden="true" /> {who === 'client' ? 'Bahan yang kami perlukan dari Anda' : 'Bahan dari klien'}</h3>
        <span className={k.count}>{st.reqReady}/{st.reqTotal} wajib siap</span>
      </div>
      {who === 'client' && !p.startDate && <p className={k.intro}>Pengerjaan {tpl?.workdays ?? ''} hari kerja dimulai begitu bahan wajib lengkap. Unggah file langsung di sini (maks. 20 MB), atau kirim lewat WhatsApp/link Google Drive lalu beri tahu kami.</p>}
      <ul className={k.list}>
        {sorted.map((m) => <Item key={m.id} m={m} who={who} pending={pending} onSet={onSet ? (s) => onSet(m.id, s) : undefined} onSent={onSent ? (n) => onSent(m.id, n) : undefined} onUpload={onUpload ? (f) => onUpload(m.id, f) : undefined} />)}
      </ul>
      {who !== 'client' && !p.startDate && (
        <div className={k.foot}>
          {st.missing.some((m) => m.status !== 'sent') && (
            <div className={k.row}>
              <Button size="sm" variant="secondary" icon={<Copy size={16} aria-hidden="true" />} onClick={copy}>Salin pesan pengingat</Button>
              <Button size="sm" variant="secondary" icon={<MessageCircle size={16} aria-hidden="true" />} href={`https://wa.me/?text=${encodeURIComponent(msg)}`}>Kirim via WhatsApp</Button>
            </div>
          )}
          {who === 'owner' && onStart && (st.ready ? (
            <form className={k.start} onSubmit={(e) => { e.preventDefault(); onStart(start); }}>
              <label><span>Mulai hari kerja ke-1</span><input type="date" value={start} min={today} onChange={(e) => setStart(e.target.value)} required /></label>
              <Button type="submit" size="sm" loading={pending} icon={<Play size={16} aria-hidden="true" />}>Mulai hitung {tpl?.workdays} hari kerja</Button>
              {st.fallbacks.length > 0 && <small className={k.detail}>{st.fallbacks.length} bahan memakai Rencana B — otomatis dibuat tugas &quot;Ganti Rencana B dengan bahan asli&quot;.</small>}
            </form>
          ) : (
            <p className={k.hint}><ShieldAlert size={16} aria-hidden="true" />{st.blockers.length ? `Tidak bisa mulai tanpa: ${st.blockers.map((b) => b.label).join(', ')}.` : 'Tandai bahan wajib sebagai Diterima, atau pilih Rencana B, untuk mulai.'}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/** Day-by-day plan of a template (deadlines shown once a start date is known). */
export function PlanPreview({ templateId, start, who = {} }: { templateId: string; start?: string | null; who?: Partial<Record<string, string>> }) {
  const tpl = templateById(templateId);
  if (!tpl) return null;
  const days = [...new Set(tpl.plan.map((t) => t.day))].sort((a, b) => a - b);
  return (
    <ol className={k.plan}>
      {days.map((d) => (
        <li key={d}>
          <span className={k.day}><CalendarClock size={14} aria-hidden="true" />Hari {d}{start ? ` · ${fmtDate(dueFor(start, d))}` : ''}</span>
          <ul>{tpl.plan.filter((t) => t.day === d).map((t) => <li key={t.title}><strong>{t.title}</strong><small>{who[t.role] ?? roleName[t.role]}</small></li>)}</ul>
        </li>
      ))}
    </ol>
  );
}

/** "Proyek baru" form with template choice + live preview of what will be created. */
export function NewProjectForm({ pending, onSubmit, onCancel, today }: { pending?: boolean; today: string; onCancel: () => void; onSubmit: (v: { client: string; project: string; template: string; materialsDue: string }) => void }) {
  const [client, setClient] = useState('');
  const [project, setProject] = useState('');
  const [template, setTemplate] = useState(templates[0].id);
  const [due, setDue] = useState('');
  const tpl = templateById(template);
  return (
    <form className={k.form} onSubmit={(e) => { e.preventDefault(); onSubmit({ client, project, template, materialsDue: due }); }}>
      <fieldset className={k.choices}>
        <legend>Jenis proyek</legend>
        {templates.map((t) => (
          <label key={t.id} className={k.choice}><input type="radio" name="tpl" value={t.id} checked={template === t.id} onChange={() => setTemplate(t.id)} /><span><strong>{t.name}</strong><small>{t.summary}</small></span></label>
        ))}
        <label className={k.choice}><input type="radio" name="tpl" value="" checked={template === ''} onChange={() => setTemplate('')} /><span><strong>Proyek kosong</strong><small>Tanpa daftar bahan dan rencana; tugas dibuat manual.</small></span></label>
      </fieldset>
      <label className={k.field}><span>Nama klien</span><input value={client} onChange={(e) => setClient(e.target.value)} maxLength={120} required /></label>
      <label className={k.field}><span>Nama proyek</span><input value={project} onChange={(e) => setProject(e.target.value)} maxLength={160} placeholder="mis. Landing Page Malam Puncak Akhir Tahun" required /></label>
      {tpl && <label className={k.field}><span>Tenggat bahan dari klien (opsional)</span><input type="date" value={due} min={today} onChange={(e) => setDue(e.target.value)} /></label>}
      {tpl && (
        <div className={k.preview}>
          <p className={k.previewHead}><CheckCircle2 size={16} aria-hidden="true" /> Otomatis dibuat: {tpl.materials.length} daftar bahan klien ({tpl.materials.filter((m) => m.required).length} wajib) + {tpl.plan.length} tugas. Deadline baru dihitung saat bahan wajib lengkap.</p>
          <PlanPreview templateId={tpl.id} />
        </div>
      )}
      <div className={k.row}><Button type="submit" size="sm" loading={pending} disabled={client.trim().length < 2 || project.trim().length < 2}>Buat proyek</Button><Button type="button" size="sm" variant="secondary" onClick={onCancel}>Batal</Button></div>
    </form>
  );
}

/** Owner's "Hari Ini" block: which projects are stuck waiting for the client, and for how long. */
export function WaitingKits({ items, today }: { items: KitProject[]; today: string }) {
  return (
    <ul className={k.waiting}>
      {items.map((p) => {
        const st = kitState(p.materials);
        const late = p.materialsDue ? daysBetween(p.materialsDue, today) : null;
        return (
          <li key={p.id}>
            <span className={k.itemMain}>
              <a href={`/os/projects#p-${p.id}`} className={k.label}>{p.client} · {p.name}</a>
              <small className={k.detail}>{st.ready ? 'Bahan wajib lengkap — tinggal tekan Mulai.' : `Kurang ${st.reqTotal - st.reqReady} bahan wajib: ${st.missing.filter((m) => m.required).map((m) => m.label.split(' (')[0]).join(', ')}`}</small>
            </span>
            {st.ready ? <span className={`${osUi.pill} ${osUi.t_good}`}><i aria-hidden="true" />Siap mulai</span>
              : late !== null && late > 0 ? <span className={`${osUi.pill} ${osUi.t_bad}`}><i aria-hidden="true" />Tenggat lewat {late} hari</span>
              : <span className={`${osUi.pill} ${osUi.t_warn}`}><i aria-hidden="true" />Menunggu klien</span>}
            <Button size="sm" variant="secondary" href={`/os/projects#p-${p.id}`} arrow>Buka</Button>
          </li>
        );
      })}
    </ul>
  );
}
