import Link from 'next/link';
import { AlertTriangle, CalendarClock, ClipboardCheck, Clock, FileText, FolderKanban, ListChecks, Users } from 'lucide-react';
import { Button } from '@/components/motion';
import { AnimIcon } from '@/components/icons/AnimIcon';
import { stageLabel, statuses, type Person, type Task } from '@/lib/workflow';
import type { DashboardData } from '@/server/data';
import { EmptyState, FlowChevrons, KpiCard, PageHeader, Panel, osUi } from '../ui';
import s from './tasks.module.css';

const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

/** Dashboard (live): every number is counted from rows this user may read. Calm motion: count-up, icon draw, list fade. */
export function DashboardLive({ data }: { data: DashboardData }) {
  const k = data.kpi;
  const cards = [
    { label: 'Proyek aktif', value: k.projects, icon: FolderKanban, fx: 'bounce' as const },
    { label: data.owner ? 'Tugas aktif (tim)' : 'Tugas aktif saya', value: k.tasks, icon: ListChecks, fx: 'bounce' as const },
    { label: 'Menunggu approval', value: k.approvals, icon: ClipboardCheck, fx: 'pulse' as const },
    { label: 'Terlambat', value: k.overdue, icon: Clock, fx: 'wiggle' as const },
    { label: 'Blocked', value: k.blocked, icon: AlertTriangle, fx: 'wiggle' as const },
    ...(data.owner ? [{ label: 'Prospek baru', value: k.newLeads, icon: Users, fx: 'bounce' as const }, { label: 'Penawaran berjalan', value: k.quotesOpen, icon: FileText, fx: 'tilt' as const }] : []),
  ];
  return (
    <>
      <PageHeader title="Halo," highlight={data.name.split(' ')[0] || 'Tim'} sub={`Ringkasan pekerjaan per ${fmt(data.today)} — dihitung langsung dari data tersimpan.`}
        actions={<div className={s.quick}><Button href="/os/tasks" size="sm" arrow>Tugas &amp; Approval</Button>{data.owner && <Button href="/os/crm" size="sm" variant="secondary">CRM</Button>}{data.owner && <Button href="/os/quotations" size="sm" variant="secondary">Penawaran</Button>}</div>} />
      <div className={s.kpis}>
        {cards.map((c) => <div key={c.label} data-ai-host><KpiCard label={c.label} value={c.value} icon={<AnimIcon icon={c.icon} size={22} fx={c.fx} />} /></div>)}
      </div>
      <Panel title="Pipeline produksi (tugas aktif per tahap)">
        <FlowChevrons label="Jumlah tugas aktif per tahap" steps={data.stages.map((x) => ({ label: stageLabel(x.id), count: x.count, unit: 'tugas' }))} />
      </Panel>
      <div className={s.grid2} style={{ marginTop: 16 }}>
        <Panel title="Deadline hari ini & terlambat" icon={<CalendarClock size={18} aria-hidden="true" />}>
          {data.due.length ? (
            <ul className={s.list}>
              {data.due.map((t) => {
                const st = statuses[t.overdue ? 'overdue' : (t.status as keyof typeof statuses)] ?? statuses.draft;
                return <li key={t.id}><Link href={`/os/tasks?task=${t.id}`} className={s.row}><span className={s.rowMain}><strong>{t.title}</strong><small>{t.client} · {fmt(t.due)}</small></span><span className={`${osUi.pill} ${osUi['t_' + st.tone]}`}><i aria-hidden="true" />{st.label}</span></Link></li>;
              })}
            </ul>
          ) : <EmptyState title="Aman" body="Tidak ada deadline hari ini dan tidak ada yang terlambat." />}
        </Panel>
        <Panel title="Aktivitas terbaru">
          {data.feed.length ? <ol className={s.feed}>{data.feed.map((f, i) => <li key={i}><small>{f.at} · {f.who}</small><span><strong>{f.task}</strong> — {f.text}</span></li>)}</ol> : <EmptyState title="Belum ada aktivitas" body="Perubahan status tugas akan tercatat di sini." />}
        </Panel>
      </div>
    </>
  );
}

const PIPE = ['planning', 'prep', 'production', 'editing', 'owner', 'scheduling', 'publishing'] as const;
/** Produksi Konten (live): the content pipeline — active tasks grouped by production stage. */
export function ContentLive({ tasks, people, today }: { tasks: Task[]; people: Person[]; today: string }) {
  const active = tasks.filter((t) => t.status !== 'completed' && (PIPE as readonly string[]).includes(t.stage));
  const name = (id: string | null) => people.find((p) => p.id === id)?.name ?? 'Belum ada PIC';
  return (
    <>
      <PageHeader title="Produksi" highlight="Konten" sub="Posisi setiap konten di alur produksi: perencanaan → persiapan → produksi → editing → approval → jadwal → terbit." actions={<Button href="/os/tasks" size="sm" arrow>Kelola di Tugas &amp; Approval</Button>} />
      <Panel title={`Pipeline (${active.length} konten aktif)`}>
        {active.length ? (
          <div className={s.board} tabIndex={0} role="region" aria-label="Pipeline produksi (dapat digeser)">
            {PIPE.map((stage) => {
              const items = active.filter((t) => t.stage === stage);
              return (
                <section key={stage} className={s.col} aria-label={`${stageLabel(stage)}, ${items.length} konten`}>
                  <h3 className={s.h3}>{stageLabel(stage)} ({items.length})</h3>
                  <ul className={s.list}>
                    {items.map((t) => {
                      const late = !!t.due && t.due < today && !['approved', 'published'].includes(t.status);
                      const st = statuses[late ? 'overdue' : t.status];
                      return (
                        <li key={t.id}>
                          <Link href={`/os/tasks?task=${t.id}`} className={s.kcard}>
                            <strong>{t.title}</strong>
                            <small>{t.client} · {name(t.pic)}{t.due ? ` · ${fmt(t.due)}` : ''}</small>
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
        ) : <EmptyState title="Belum ada konten aktif" body="Buat tugas produksi dari Tugas & Approval → Tugas baru." />}
      </Panel>
    </>
  );
}
