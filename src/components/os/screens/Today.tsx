'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { AlertTriangle, ArrowRight, Hourglass, CheckCircle2, ClipboardCheck, FileText, FolderPlus, ListChecks, UserPlus, Users } from 'lucide-react';
import { Button, useToast } from '@/components/motion';
import { AnimIcon } from '@/components/icons/AnimIcon';
import { DEMO_TODAY, workflowTasks } from '@/fixtures/workflow.demo';
import { leads as demoLeads, quotations as demoQuotes } from '@/fixtures/os.demo';
import { actionLabels, availableActions, stageLabel, statuses, type Person, type Task, type TaskAction } from '@/lib/workflow';
import { transitionTask } from '@/server/actions/tasks';
import type { Workspace } from '@/server/data';
import { DemoNote, EmptyState, PageHeader, Panel, osUi } from '../ui';
import { StageTrack } from '../StageTrack';
import { WaitingKits, type KitProject } from '../kit/ProjectKit';
import { demoKits } from '@/fixtures/kit.demo';
import { demoPeople, demoTransition } from './Tasks';
import s from './today.module.css';

const DONE = ['approved', 'published', 'completed'];
const ONE_CLICK: TaskAction[] = ['start', 'finish', 'submit', 'approve', 'schedule', 'unblock', 'complete'];
const fmtDay = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

/**
 * "Hari Ini" — the entry point for everyone. One list of what to do now, sorted by urgency, each with ONE
 * next-step button. The Owner also sees "Perlu keputusan Anda". Live: database (RLS). Demo: fixtures in memory.
 */
export function TodayScreen({ live, counts, demoAs, kits }: { live?: Workspace; counts?: { newLeads: number; quotesOpen: number }; demoAs?: string; kits?: KitProject[] }) {
  const toast = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [demoTasks, setDemoTasks] = useState<Task[]>(workflowTasks);
  const people: Person[] = live ? live.people : demoPeople;
  const tasks = live ? live.tasks : demoTasks;
  const today = live ? live.today : DEMO_TODAY;
  const me = live ? live.me : demoPeople.find((p) => p.id === (demoAs ?? 'surya')) ?? demoPeople[0];
  const owner = me.role === 'owner';
  const c = counts ?? (live ? undefined : { newLeads: demoLeads.filter((l) => l.status === 'NEW').length, quotesOpen: demoQuotes.filter((q) => !['ACCEPTED', 'REJECTED'].includes(q.status as string)).length });
  const late = (t: Task) => !!t.due && t.due < today && !DONE.includes(t.status);
  const rank = (t: Task) => (late(t) ? 0 : t.status === 'blocked' ? 1 : t.due === today ? 2 : t.status === 'revision' ? 3 : 4);

  const mine = tasks.filter((t) => t.pic === me.id && t.status !== 'completed' && !(t.status === 'review' && (!owner || t.stage === 'client')))
    .sort((a, b) => rank(a) - rank(b) || (a.due ?? '9999').localeCompare(b.due ?? '9999'));
  const waiting = owner ? [] : tasks.filter((t) => t.status === 'review' && t.history.some((h) => h.by === me.id));
  const approvals = tasks.filter((t) => t.status === 'review' && t.stage !== 'client');
  const atClient = tasks.filter((t) => t.status === 'review' && t.stage === 'client');
  const doNow = owner ? mine.filter((t) => t.status !== 'review') : mine;

  const act = (t: Task, a: TaskAction) => {
    if (live) start(async () => {
      const r = await transitionTask(t.id, a).catch(() => ({ ok: false as const, error: 'Terjadi gangguan. Coba lagi.' }));
      if (r.ok) { toast({ tone: 'success', title: actionLabels[a] }); router.refresh(); } else toast({ tone: 'error', title: 'Tidak tersimpan', body: r.error });
    });
    else {
      const r = demoTransition(t, a, '');
      setDemoTasks((all) => all.map((x) => (x.id === t.id ? { ...x, ...r.patch, history: [...x.history, { at: 'Baru saja', by: me.id, text: r.log }] } : x)));
      toast({ tone: 'success', title: r.log, body: 'DATA DEMO — tidak tersimpan' });
    }
  };

  const Row = ({ t, decide }: { t: Task; decide?: boolean }) => {
    const acts = availableActions(t, me.id, owner);
    const main = acts.find((a) => ONE_CLICK.includes(a));
    const st = statuses[late(t) ? 'overdue' : t.status];
    return (
      <li className={s.row}>
        <div className={s.rowMain}>
          <Link href={`/os/tasks?task=${t.id}`} className={s.title}>{t.title}</Link>
          <span className={s.meta}>{t.client} · {stageLabel(t.stage)}{t.due ? ` · ${late(t) ? 'terlambat sejak' : 'deadline'} ${fmt(t.due)}` : ''}</span>
          <span className={s.trackRow}><StageTrack stage={t.stage} status={t.status} compact /><span className={`${osUi.pill} ${osUi['t_' + st.tone]}`}><i aria-hidden="true" />{st.label}</span></span>
          {t.blocker && <span className={s.blocker}><AlertTriangle size={14} aria-hidden="true" />{t.blocker}</span>}
        </div>
        <div className={s.rowAct}>
          {decide ? (
            <>
              <Button size="sm" disabled={pending} onClick={() => act(t, 'approve')}>Setujui</Button>
              <Button size="sm" variant="secondary" href={`/os/tasks?task=${t.id}`}>Periksa dulu</Button>
            </>
          ) : main ? (
            <Button size="sm" disabled={pending} onClick={() => act(t, main)} arrow>{actionLabels[main]}</Button>
          ) : (
            <Button size="sm" variant="secondary" href={`/os/tasks?task=${t.id}`} arrow>{acts.length ? 'Buka tugas' : 'Lihat'}</Button>
          )}
        </div>
      </li>
    );
  };

  const first = me.name.split(' ')[0] || 'Tim';
  const summary = doNow.length ? `${doNow.length} hal perlu kamu kerjakan${doNow.filter(late).length ? `, ${doNow.filter(late).length} di antaranya terlambat` : ''}.` : 'Tidak ada yang perlu kamu kerjakan sekarang.';
  return (
    <>
      <PageHeader title="Halo," highlight={first} sub={`${fmtDay(today)} — ${summary}`} />
      {!live && <DemoNote>Mode demo: tombol di halaman ini mengubah data contoh di browser saja.</DemoNote>}

      {owner && live && !tasks.length && (
        <Panel title="Mulai dari sini">
          <ol className={s.steps}>
            <li data-ai-host><AnimIcon icon={FolderPlus} tile color="#C7F60C" size={22} /><span><strong>Buat proyek</strong> pertama, atau ubah penawaran yang diterima menjadi proyek.</span><Button size="sm" href="/os/projects" arrow>Proyek</Button></li>
            <li data-ai-host><AnimIcon icon={ListChecks} tile color="#49B7FF" size={22} /><span><strong>Buat tugas</strong> dan pilih PIC untuk tahap pertamanya.</span><Button size="sm" href="/os/tasks" arrow>Tugas</Button></li>
            <li data-ai-host><AnimIcon icon={UserPlus} tile color="#FF7AC6" size={22} /><span><strong>Atur tim</strong>: beri peran Roby, Ojak, Ares, dan Bima.</span><Button size="sm" href="/os/team" arrow>Tim</Button></li>
          </ol>
        </Panel>
      )}

      {owner && (
        <Panel title="Perlu keputusan Anda" icon={<ClipboardCheck size={18} aria-hidden="true" />}>
          <div className={s.decide}>
            <Link href="/os/tasks" className={s.tile} data-ai-host><AnimIcon icon={ClipboardCheck} size={22} fx="pulse" /><strong>{approvals.length}</strong><span>konten menunggu approval</span></Link>
            <Link href="/os/crm" className={s.tile} data-ai-host><AnimIcon icon={Users} size={22} fx="bounce" /><strong>{c ? c.newLeads : '–'}</strong><span>prospek baru</span></Link>
            <Link href="/os/quotations" className={s.tile} data-ai-host><AnimIcon icon={FileText} size={22} fx="tilt" /><strong>{c ? c.quotesOpen : '–'}</strong><span>penawaran berjalan</span></Link>
          </div>
          {approvals.length > 0 && <ul className={s.list}>{approvals.map((t) => <Row key={t.id} t={t} decide />)}</ul>}
        </Panel>
      )}

      {owner && ((live ? kits ?? [] : demoKits).length > 0 || atClient.length > 0) && (
        <Panel title="Menunggu klien" icon={<Hourglass size={18} aria-hidden="true" />}>
          {(live ? kits ?? [] : demoKits).length > 0 && <><h3 className={s.sub}>Bahan dari klien</h3><WaitingKits items={live ? kits ?? [] : demoKits} today={today} /></>}
          {atClient.length > 0 && <><h3 className={s.sub}>Menunggu persetujuan klien di Portal</h3><ul className={s.list}>{atClient.map((t) => <Row key={t.id} t={t} />)}</ul></>}
        </Panel>
      )}

      <Panel title={owner ? 'Pekerjaan Anda' : 'Kerjakan sekarang'} icon={<ListChecks size={18} aria-hidden="true" />}>
        {doNow.length ? <ul className={s.list}>{doNow.map((t) => <Row key={t.id} t={t} />)}</ul>
          : <EmptyState title="Semua beres" body={owner ? 'Tidak ada tugas atas nama Anda.' : 'Tidak ada tugas yang menunggu kamu. Cek lagi nanti atau tanya Owner.'} />}
      </Panel>

      {waiting.length > 0 && (
        <Panel title="Sudah kamu serahkan — menunggu Owner">
          <ul className={s.list}>{waiting.map((t) => <Row key={t.id} t={t} />)}</ul>
        </Panel>
      )}

      {owner && (
        <Panel title="Tim hari ini" icon={<Users size={18} aria-hidden="true" />}>
          <ul className={s.team}>
            {people.filter((p) => p.id !== me.id).map((p) => {
              const n = tasks.filter((t) => t.pic === p.id && t.status !== 'completed');
              const l = n.filter(late).length;
              return (
                <li key={p.id}>
                  <span className={osUi.avatar} style={{ width: 32, height: 32, ['--ac' as string]: p.color }} aria-hidden="true">{p.initials}</span>
                  <span className={s.who}><strong>{p.name}</strong><small>{p.roleLabel}</small></span>
                  <span className={s.count}>{n.length} tugas{l ? <em> · {l} terlambat</em> : ''}</span>
                </li>
              );
            })}
          </ul>
          <p className={s.more}><Link href="/os/tasks">Lihat semua tugas <ArrowRight size={14} aria-hidden="true" /></Link></p>
        </Panel>
      )}
      {!owner && !doNow.length && !waiting.length && <p className={s.more}><CheckCircle2 size={16} aria-hidden="true" /> Kerja bagus.</p>}
    </>
  );
}
