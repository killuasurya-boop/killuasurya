'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardCheck, Clock, Link2, ListChecks, Paperclip, Plus, Send } from 'lucide-react';
import { AnimatedDrawer, AnimatedModal, AnimatedTabs, Button, useToast } from '@/components/motion';
import { team } from '@/fixtures/os.demo';
import { DEMO_TODAY, demoStagePic, workflowTasks } from '@/fixtures/workflow.demo';
import { actionLabels, availableActions, isUrl, roleLabels, stageLabel, stages, statuses, type Person, type StageId, type Task, type TaskAction } from '@/lib/workflow';
import { addComment, createTask, reassignTask, toggleChecklist, transitionTask } from '@/server/actions/tasks';
import type { Workspace } from '@/server/data';
import { CountUp, DemoNote, EmptyState, PageHeader, Panel, osUi } from '../ui';
import { AnimIcon } from '@/components/icons/AnimIcon';
import { StageTrack, nextStage } from '../StageTrack';
import s from './tasks.module.css';

const DONE = ['approved', 'published', 'completed'];
export const demoPeople: Person[] = team.map((m) => ({ id: m.id, name: m.name, role: m.id === 'surya' ? 'owner' : 'staff', roleLabel: m.role, initials: m.initials, color: m.color }));
const fmt = (d: string | null) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Tanpa deadline');
const addDays = (d: string, n: number) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };

/** Demo-only reducer mirroring task_transition() in the database (which is the authority in live mode). */
export function demoTransition(t: Task, a: TaskAction, text: string): { patch: Partial<Task>; log: string } {
  const to = (stage: StageId, status: Task['status'], log: string) => ({ patch: { stage, status, pic: demoStagePic[stage], blocker: null }, log: `${log} → ${stageLabel(stage)} (${demoPeople.find((p) => p.id === demoStagePic[stage])?.name})` });
  switch (a) {
    case 'start': return { patch: { status: 'progress' }, log: 'Status → In Progress' };
    case 'submit': return { patch: { status: 'review', stage: 'owner', pic: 'surya' }, log: `Dikirim untuk approval Owner (dari ${stageLabel(t.stage)})` };
    case 'approve': return to('scheduling', 'ready', 'Disetujui Owner');
    case 'revise': return { patch: { status: 'revision', stage: 'editing', pic: 'ares' }, log: 'Revisi diminta → kembali ke Editing (riwayat disimpan)' };
    case 'schedule': return { patch: { status: 'scheduled', stage: 'publishing' }, log: 'Dijadwalkan → Publishing' };
    case 'publish': return { patch: { status: 'published', publishedUrl: text }, log: 'Status → Published (tautan dicatat)' };
    case 'block': return { patch: { status: 'blocked', blocker: text }, log: `Status → Blocked · ${text}` };
    case 'unblock': return { patch: { status: 'ready', blocker: null }, log: 'Blokir dibuka → Ready' };
    case 'complete': return { patch: { status: 'completed' }, log: 'Status → Completed' };
    case 'finish': return { patch: { status: 'completed' }, log: 'Selesai' };
    case 'send_client': return { patch: { status: 'review', stage: 'client', previewUrl: text }, log: 'Dikirim ke klien untuk persetujuan (link pratinjau dicatat)' };
  }
}

function Av({ p, size = 28 }: { p?: Person; size?: number }) {
  return <span className={osUi.avatar} style={{ width: size, height: size, ['--ac' as string]: p?.color ?? 'var(--border-strong)' }} title={p ? `${p.name} — ${p.roleLabel}` : 'Belum ada PIC'}><span aria-hidden="true">{p?.initials ?? '–'}</span><span className="sr-only">{p?.name ?? 'Belum ada PIC'}</span></span>;
}

/**
 * Tugas & Approval — V5 Phase 3/4: My Tasks, deadlines, Approval Center, workload, timeline, Smart Task Detail.
 * `live` = data from the database (permissions enforced by RLS + task_transition). Without it: DATA DEMO in memory.
 */
export function TasksScreen({ live, demoAs }: { live?: Workspace; demoAs?: string }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [demoMe, setDemoMe] = useState(demoAs ?? 'surya');   // signed-in demo account, or Owner by default
  const [demoTasks, setDemoTasks] = useState<Task[]>(workflowTasks);
  const [tab, setTab] = useState('mine');
  const [openId, setOpenId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [creating, setCreating] = useState(false);
  const [ticks, setTicks] = useState<Record<string, boolean>>({});   // optimistic checklist state (live mode)

  // Deep link from the project board: /os/tasks?task=<id> opens that task's detail.
  useEffect(() => { const id = new URLSearchParams(window.location.search).get('task'); if (id) { setOpenId(id); setTab('all'); } }, []);

  const people = live ? live.people : demoPeople;
  const tasks = live ? live.tasks : demoTasks;
  const today = live ? live.today : DEMO_TODAY;
  const me = live ? live.me : demoPeople.find((p) => p.id === demoMe)!;
  const owner = me.role === 'owner';
  const person = (id: string | null) => people.find((p) => p.id === id);
  const nameOf = (id: string | null) => person(id)?.name ?? (id ? 'Anggota' : 'Sistem');
  /** Who picks the work up after the current stage (demo: fixed default PIC; live: first member with that role). */
  const nextWho = (stage: string) => { const n = nextStage(stage); if (!n) return undefined; return live ? people.find((p) => p.role === n.role)?.name : people.find((p) => p.id === demoStagePic[n.id])?.name; };
  const isOverdue = (t: Task) => !!t.due && t.due < today && !DONE.includes(t.status);
  const open = tasks.find((t) => t.id === openId) ?? null;
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i - 2)), [today]);

  const visible = useMemo(() => (live || owner ? tasks : tasks.filter((t) => t.pic === me.id)), [tasks, me.id, owner, live]);
  const mine = tasks.filter((t) => t.pic === me.id && t.status !== 'completed');
  const approvals = tasks.filter((t) => t.status === 'review' && t.stage !== 'client');
  const stats = [
    { label: 'Tugas saya', value: mine.length, icon: ListChecks },
    { label: 'Deadline hari ini', value: mine.filter((t) => t.due === today).length, icon: CalendarClock },
    { label: 'Menunggu approval', value: approvals.length, icon: ClipboardCheck },
    { label: 'Terlambat', value: visible.filter(isOverdue).length, icon: Clock },
    { label: 'Blocked', value: visible.filter((t) => t.status === 'blocked').length, icon: AlertTriangle },
  ];

  /** Live: call the server, then re-read from the database. Demo: change memory only. */
  const server = (job: () => Promise<{ ok: true } | { ok: false; error: string }>, okTitle: string) =>
    start(async () => {
      const r = await job().catch(() => ({ ok: false as const, error: 'Terjadi gangguan. Coba lagi.' }));
      if (r.ok) { toast({ tone: 'success', title: okTitle }); router.refresh(); } else toast({ tone: 'error', title: 'Tidak tersimpan', body: r.error });
    });
  const demoPatch = (id: string, patch: Partial<Task>, log: string) => {
    setDemoTasks((all) => all.map((t) => (t.id === id ? { ...t, ...patch, history: [...t.history, { at: 'Baru saja', by: me.id, text: log }] } : t)));
    toast({ tone: 'success', title: log, body: 'DATA DEMO — tidak tersimpan ke server' });
  };

  const act = (t: Task, a: TaskAction) => {
    const arg = a === 'publish' || a === 'send_client' ? link.trim() : a === 'block' ? text.trim() : '';
    if (live) server(() => transitionTask(t.id, a, arg || undefined), actionLabels[a]);
    else { const r = demoTransition(t, a, arg); demoPatch(t.id, r.patch, r.log); }
    setText(''); setLink('');
  };
  const disabled = (a: TaskAction) => pending || ((a === 'publish' || a === 'send_client') && !isUrl(link.trim())) || (a === 'block' && text.trim().length < 3);
  const primary: TaskAction[] = ['start', 'submit', 'approve', 'schedule', 'publish', 'unblock', 'complete', 'finish', 'send_client'];

  const Pill = ({ t }: { t: Task }) => {
    const st = statuses[isOverdue(t) ? 'overdue' : t.status];
    return <span className={`${osUi.pill} ${osUi['t_' + st.tone]}`} title={st.hint}><i aria-hidden="true" />{st.label}</span>;
  };
  const Row = ({ t }: { t: Task }) => (
    <li>
      <button type="button" className={s.row} onClick={() => { setOpenId(t.id); setComment(''); setText(''); }}>
        <span className={s.rowMain}><strong>{t.title}</strong><small>{t.client} · {stageLabel(t.stage)}</small></span>
        <span className={s.rowMeta}>
          <Pill t={t} />
          <span className={`${s.due} ${isOverdue(t) ? s.late : ''}`}><Clock size={14} aria-hidden="true" />{fmt(t.due)}</span>
          <Av p={person(t.pic)} />
        </span>
      </button>
    </li>
  );
  const List = ({ items, empty }: { items: Task[]; empty: string }) =>
    items.length ? <ul className={s.list}>{items.map((t) => <Row key={t.id} t={t} />)}</ul> : <EmptyState title="Tidak ada tugas" body={empty} />;

  const tabs = [
    { id: 'mine', label: `Tugas Saya (${mine.length})` },
    { id: 'all', label: owner ? `Semua Tugas (${tasks.length})` : 'Tugas Tim Saya' },
    { id: 'approval', label: `Approval (${approvals.length})` },
    { id: 'load', label: 'Beban Tim' },
    { id: 'timeline', label: 'Timeline' },
  ];
  const acts = open ? availableActions(open, me.id, owner) : [];
  const canEdit = !!open && (owner || open.pic === me.id);

  return (
    <>
      <PageHeader title="Tugas &" highlight="Approval" sub="Siapa mengerjakan apa, kapan deadline-nya, dan apa yang menunggu persetujuan."
        actions={live ? (owner ? <Button size="sm" icon={<Plus size={18} aria-hidden="true" />} onClick={() => setCreating(true)}>Tugas baru</Button> : undefined) : (
          <label className={s.as}>
            <span>Lihat sebagai</span>
            <select value={demoMe} onChange={(e) => { setDemoMe(e.target.value); setTab('mine'); }}>
              {demoPeople.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
        )} />
      {live
        ? <p className={s.liveNote}>Masuk sebagai <strong>{me.name}</strong> · {roleLabels[me.role] ?? me.role}. Data tersimpan di server.</p>
        : <DemoNote>Mode demo: pilihan &ldquo;Lihat sebagai&rdquo; hanya simulasi tampilan per peran. Hak akses sebenarnya akan ditegakkan di server setelah login terhubung.</DemoNote>}

      <ul className={s.stats}>
        {stats.map((x) => <li key={x.label} className={s.stat} data-ai-host><AnimIcon icon={x.icon} size={20} fx="bounce" /><strong><CountUp value={x.value} /></strong><span>{x.label}</span></li>)}
      </ul>
      <div className={s.tabs}><AnimatedTabs label="Tampilan tugas" tabs={tabs} value={tab} onChange={setTab} /></div>

      {tab === 'mine' && <Panel title={`Tugas ${me.name}`}><List items={mine} empty="Semua tugas Anda sudah selesai." /></Panel>}
      {tab === 'all' && <Panel title={owner ? 'Semua tugas' : 'Tugas yang ditugaskan ke saya'}><List items={visible} empty={owner && live ? 'Belum ada tugas. Buat lewat tombol “Tugas baru”.' : 'Belum ada tugas.'} /></Panel>}
      {tab === 'approval' && (
        <Panel title="Approval Center">
          {owner ? <List items={approvals} empty="Tidak ada yang menunggu approval." /> : <EmptyState title="Khusus Owner" body="Approval konten dilakukan oleh Owner. Tugas Anda yang sedang direview tampil di Tugas Saya." />}
        </Panel>
      )}
      {tab === 'load' && (
        <Panel title="Beban kerja tim (tugas aktif)">
          <ul className={s.load}>
            {people.map((m) => {
              const n = visible.filter((t) => t.pic === m.id && t.status !== 'completed');
              const late = n.filter(isOverdue).length;
              return (
                <li key={m.id}>
                  <Av p={m} size={32} />
                  <span className={s.loadName}><strong>{m.name}</strong><small>{m.roleLabel}</small></span>
                  <span className={s.bar} aria-hidden="true"><i style={{ width: `${Math.min(100, n.length * 25)}%` }} /></span>
                  <span className={s.loadNum}>{n.length} tugas{late ? ` · ${late} terlambat` : ''}</span>
                </li>
              );
            })}
          </ul>
          {live && !owner && <p className={s.none} style={{ marginTop: 12 }}>Anda hanya melihat tugas yang ditugaskan kepada Anda.</p>}
        </Panel>
      )}
      {tab === 'timeline' && (
        <Panel title="Timeline minggu ini" pad={false}>
          <div className={osUi.tableWrap} tabIndex={0} role="region" aria-label="Timeline (dapat digeser)">
            <table className={s.tl}>
              <thead><tr><th scope="col">Tugas</th>{days.map((d) => <th key={d} scope="col" className={d === today ? s.today : ''}>{fmt(d)}</th>)}</tr></thead>
              <tbody>
                {visible.map((t) => (
                  <tr key={t.id}>
                    <th scope="row"><button type="button" className={s.tlBtn} onClick={() => setOpenId(t.id)}>{t.title}</button></th>
                    {days.map((d) => <td key={d} className={d === today ? s.today : ''}>{d === t.due && <span className={`${s.dot} ${isOverdue(t) ? s.dotLate : ''}`}><span className="sr-only">Deadline {nameOf(t.pic)}</span></span>}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <AnimatedDrawer open={!!open} onClose={() => setOpenId(null)} title={open ? `${open.code} · Detail tugas` : 'Detail tugas'}>
        {open && (
          <div className={s.detail}>
            <div>
              <h2 className={s.dTitle}>{open.title}</h2>
              <p className={s.dDesc}>{open.desc}</p>
            </div>
            <StageTrack stage={open.stage} status={open.status} nextWho={nextWho(open.stage)} />
            <dl className={s.meta}>
              <div><dt>Status</dt><dd><Pill t={open} /></dd></div>
              <div><dt>Tahap</dt><dd>{stageLabel(open.stage)}</dd></div>
              <div><dt>Klien · Proyek</dt><dd>{open.client} · {open.project}</dd></div>
              <div><dt>Deadline</dt><dd>{fmt(open.due)} · Prioritas {open.priority}</dd></div>
              <div><dt>PIC</dt><dd>
                {owner ? (
                  <select aria-label="Ubah PIC" className={s.sel} value={open.pic ?? ''} disabled={pending}
                    onChange={(e) => (live ? server(() => reassignTask(open.id, e.target.value), `PIC diubah ke ${nameOf(e.target.value)}`) : demoPatch(open.id, { pic: e.target.value }, `PIC diubah ke ${nameOf(e.target.value)}`))}>
                    {!open.pic && <option value="">Belum ada</option>}
                    {people.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                ) : nameOf(open.pic)}
              </dd></div>
            </dl>
            {open.blocker && <p className={s.blocker} role="note"><AlertTriangle size={16} aria-hidden="true" />{open.blocker}</p>}

            <section aria-label="Checklist">
              <h3 className={s.h3}>Checklist ({open.checklist.filter((c) => ticks[c.id] ?? c.done).length}/{open.checklist.length})</h3>
              {open.checklist.length ? (
                <ul className={s.checks}>
                  {open.checklist.map((c) => (
                    <li key={c.id}>
                      <label><input type="checkbox" checked={ticks[c.id] ?? c.done} disabled={!canEdit || pending}
                        onChange={() => (live ? (setTicks((x) => ({ ...x, [c.id]: !(x[c.id] ?? c.done) })), server(() => toggleChecklist(c.id, !(ticks[c.id] ?? c.done)), 'Checklist diperbarui')) : setDemoTasks((all) => all.map((t) => (t.id === open.id ? { ...t, checklist: t.checklist.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)) } : t))))} /><span>{c.text}</span></label>
                    </li>
                  ))}
                </ul>
              ) : <p className={s.none}>Tidak ada checklist.</p>}
            </section>

            <section aria-label="Lampiran">
              <h3 className={s.h3}>Lampiran</h3>
              {open.files.length ? <ul className={s.files}>{open.files.map((f) => <li key={f}><Paperclip size={14} aria-hidden="true" />{f}</li>)}</ul> : <p className={s.none}>Belum ada file.</p>}
              {open.publishedUrl && <p className={s.none}><Link2 size={14} aria-hidden="true" /> Tautan publikasi: {open.publishedUrl}</p>}
              {open.previewUrl && <p className={s.none}><Link2 size={14} aria-hidden="true" /> Link pratinjau untuk klien: {open.previewUrl}</p>}
            </section>
            {open.clientFeedback && (
              <section aria-label="Catatan klien" className={s.clientNote}>
                <h3 className={s.h3}>Catatan klien{open.clientRounds ? ` · revisi ke-${open.clientRounds}` : ''}</h3>
                <p>{open.clientFeedback}</p>
                {(open.clientRounds ?? 0) > 1 && <p className={s.none}>Melebihi 1 putaran revisi di paket — pertimbangkan biaya tambahan.</p>}
              </section>
            )}
            {open.stage === 'client' && open.status === 'review' && <p className={s.none}><CheckCircle2 size={14} aria-hidden="true" /> Menunggu persetujuan klien di Portal.</p>}

            {acts.includes('publish') && <label className={s.field}><span>Tautan publikasi (wajib sebelum Published)</span><input type="url" inputMode="url" placeholder="https://…" value={link} onChange={(e) => setLink(e.target.value)} /></label>}
            {acts.includes('send_client') && <label className={s.field}><span>Link pratinjau untuk klien (wajib sebelum Kirim ke klien)</span><input type="url" inputMode="url" placeholder="https://…" value={link} onChange={(e) => setLink(e.target.value)} /></label>}
            {acts.includes('block') && <label className={s.field}><span>Alasan hambatan (isi bila menandai Blocked)</span><input value={text} onChange={(e) => setText(e.target.value)} placeholder="mis. lokasi belum dikonfirmasi klien" /></label>}
            <div className={s.actions}>
              {acts.map((a) => <Button key={a} size="sm" variant={primary.includes(a) ? 'primary' : 'secondary'} disabled={disabled(a)} onClick={() => act(open, a)}>{actionLabels[a]}</Button>)}
              {!acts.length && <p className={s.none}><CheckCircle2 size={14} aria-hidden="true" /> Tidak ada aksi untuk peran ini pada status sekarang.</p>}
            </div>

            <section aria-label="Komentar">
              <h3 className={s.h3}>Komentar</h3>
              <ul className={s.comments}>
                {open.comments.map((c, i) => <li key={i}><Av p={person(c.by)} size={26} /><div><strong>{nameOf(c.by)}</strong> <small>{c.at}</small><p>{c.text}</p></div></li>)}
                {!open.comments.length && <li className={s.none}>Belum ada komentar.</li>}
              </ul>
              <form className={s.cform} onSubmit={(e) => {
                e.preventDefault(); const body = comment.trim(); if (!body) return;
                if (live) server(() => addComment(open.id, body), 'Komentar terkirim');
                else setDemoTasks((all) => all.map((t) => (t.id === open.id ? { ...t, comments: [...t.comments, { by: me.id, text: body, at: 'Baru saja' }] } : t)));
                setComment('');
              }}>
                <label className="sr-only" htmlFor="task-comment">Tulis komentar</label>
                <input id="task-comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tulis komentar…" maxLength={4000} />
                <button type="submit" aria-label="Kirim komentar" disabled={!comment.trim() || pending}><Send size={16} aria-hidden="true" /></button>
              </form>
            </section>

            <section aria-label="Riwayat aktivitas">
              <h3 className={s.h3}>Riwayat</h3>
              {open.history.length ? <ol className={s.history}>{[...open.history].reverse().map((h, i) => <li key={i}><small>{h.at} · {nameOf(h.by)}</small>{h.text}</li>)}</ol> : <p className={s.none}>Belum ada riwayat.</p>}
            </section>
          </div>
        )}
      </AnimatedDrawer>

      {live && owner && <NewTask open={creating} onClose={() => setCreating(false)} people={people} projects={live.projects} busy={pending} submit={(v) => server(async () => { const r = await createTask(v); if (r.ok) setCreating(false); return r; }, 'Tugas dibuat')} />}
    </>
  );
}

type NewTaskInput = Parameters<typeof createTask>[0];
function NewTask({ open, onClose, people, projects, busy, submit }: { open: boolean; onClose: () => void; people: Person[]; projects: { id: string; label: string }[]; busy: boolean; submit: (v: NewTaskInput) => void }) {
  const [v, setV] = useState<NewTaskInput>({ title: '', description: '', projectId: projects[0]?.id ?? '', newClient: '', newProject: '', stage: 'planning', pic: people[0]?.id ?? '', due: '', priority: 2, checklist: '' });
  const set = <K extends keyof NewTaskInput>(k: K, val: NewTaskInput[K]) => setV((x) => ({ ...x, [k]: val }));
  const fresh = v.projectId === '';
  const valid = v.title.trim().length >= 2 && !!v.pic && (!fresh || (v.newClient.trim().length >= 2 && v.newProject.trim().length >= 2));
  return (
    <AnimatedModal open={open} onClose={onClose} title="Tugas baru">
      <form className={s.form} onSubmit={(e) => { e.preventDefault(); if (valid) submit(v); }}>
        <label className={s.field}><span>Judul</span><input value={v.title} onChange={(e) => set('title', e.target.value)} maxLength={200} required /></label>
        <label className={s.field}><span>Deskripsi</span><input value={v.description} onChange={(e) => set('description', e.target.value)} maxLength={500} /></label>
        <label className={s.field}><span>Proyek</span>
          <select className={s.sel} value={v.projectId} onChange={(e) => set('projectId', e.target.value)}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            <option value="">+ Proyek baru…</option>
          </select>
        </label>
        {fresh && <div className={s.two}>
          <label className={s.field}><span>Nama klien</span><input value={v.newClient} onChange={(e) => set('newClient', e.target.value)} maxLength={120} /></label>
          <label className={s.field}><span>Nama proyek</span><input value={v.newProject} onChange={(e) => set('newProject', e.target.value)} maxLength={160} /></label>
        </div>}
        <div className={s.two}>
          <label className={s.field}><span>Tahap</span><select className={s.sel} value={v.stage} onChange={(e) => set('stage', e.target.value)}>{stages.filter((x) => x.id !== 'client').map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
          <label className={s.field}><span>PIC</span><select className={s.sel} value={v.pic} onChange={(e) => set('pic', e.target.value)}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        </div>
        <div className={s.two}>
          <label className={s.field}><span>Deadline</span><input type="date" value={v.due} onChange={(e) => set('due', e.target.value)} /></label>
          <label className={s.field}><span>Prioritas</span><select className={s.sel} value={v.priority} onChange={(e) => set('priority', Number(e.target.value))}><option value={1}>Tinggi</option><option value={2}>Sedang</option><option value={3}>Rendah</option></select></label>
        </div>
        <label className={s.field}><span>Checklist (satu baris per item)</span><textarea rows={3} value={v.checklist} onChange={(e) => set('checklist', e.target.value)} /></label>
        <div className={s.actions}><Button type="submit" size="sm" loading={busy} disabled={!valid}>Buat tugas</Button><Button type="button" size="sm" variant="secondary" onClick={onClose}>Batal</Button></div>
      </form>
    </AnimatedModal>
  );
}
