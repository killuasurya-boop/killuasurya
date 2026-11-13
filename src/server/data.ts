import 'server-only';
import { roleLabels, stageLabel, statuses, type Person, type Task } from '@/lib/workflow';
import type { Material } from '@/lib/templates';
import { createSupabase, currentUser } from './supabase';

const COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)'];
const initials = (n: string) => (n.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2) || '?').toUpperCase();
const when = (iso: string) => new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
const PRIO = { 1: 'Tinggi', 2: 'Sedang', 3: 'Rendah' } as const;
const toPerson = (p: { id: string; full_name: string; role: string }, i: number): Person => ({ id: p.id, name: p.full_name || 'Tanpa nama', role: p.role, roleLabel: roleLabels[p.role] ?? p.role, initials: initials(p.full_name || '?'), color: COLORS[i % COLORS.length] });

export type Workspace = { me: Person; people: Person[]; tasks: Task[]; projects: { id: string; label: string }[]; today: string };

/** Everything the Tugas & Approval screen needs. Row Level Security decides what each role receives. */
export async function getWorkspace(): Promise<Workspace | null> {
  const user = await currentUser();
  if (!user) return null;
  const db = await createSupabase();
  const [{ data: profiles }, { data: rows }, { data: projects }] = await Promise.all([
    db.from('profiles').select('id, full_name, role').neq('role', 'client').eq('active', true).order('created_at'),
    db.from('tasks').select('id, title, description, stage, status, pic, priority, due, blocker, published_url, preview_url, client_feedback, client_rounds, needs_client, day_offset, created_at, project:projects(name, client:clients(name)), task_checklist(id, text, done, position), task_comments(author, body, created_at), task_history(actor, entry, created_at), task_files(name)').order('due', { ascending: true, nullsFirst: false }),
    db.from('projects').select('id, name, client:clients(name)').is('completed_at', null).order('created_at', { ascending: false }),
  ]);
  const people = (profiles ?? []).map(toPerson);
  const me = people.find((p) => p.id === user.id) ?? toPerson({ id: user.id, full_name: user.name, role: user.role }, 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const one = (v: any) => (Array.isArray(v) ? v[0] : v);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks: Task[] = (rows ?? []).map((r: any) => {
    const project = one(r.project);
    return {
      id: r.id, code: `T-${String(r.id).slice(0, 4).toUpperCase()}`, title: r.title, desc: r.description,
      client: one(project?.client)?.name ?? '—', project: project?.name ?? '—',
      stage: r.stage, status: r.status, pic: r.pic, due: r.due, priority: PRIO[(r.priority as 1 | 2 | 3) ?? 2],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      checklist: [...(r.task_checklist ?? [])].sort((a: any, b: any) => a.position - b.position).map((c: any) => ({ id: c.id, text: c.text, done: c.done })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      files: (r.task_files ?? []).map((f: any) => f.name),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      comments: [...(r.task_comments ?? [])].sort((a: any, b: any) => a.created_at.localeCompare(b.created_at)).map((c: any) => ({ by: c.author, text: c.body, at: when(c.created_at) })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      history: [...(r.task_history ?? [])].sort((a: any, b: any) => a.created_at.localeCompare(b.created_at)).map((h: any) => ({ by: h.actor, text: h.entry, at: when(h.created_at) })),
      publishedUrl: r.published_url, blocker: r.blocker,
      sub: r.day_offset !== null && r.day_offset !== undefined, needsClient: !!r.needs_client, previewUrl: r.preview_url, clientFeedback: r.client_feedback, clientRounds: r.client_rounds ?? 0,
    };
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectList = (projects ?? []).map((p: any) => ({ id: p.id, label: `${one(p.client)?.name ?? '—'} · ${p.name}` }));
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  return { me, people, tasks, projects: projectList, today };
}

export type Lead = { id: string; name: string; contact: string; business: string; services: string[]; packageCode: string | null; needs: string; budget: string; status: string; notes: string; followUp: string | null; createdAt: string };
/** Owner only (RLS returns nothing for anyone else). */
export async function getLeads(): Promise<{ owner: boolean; leads: Lead[] } | null> {
  const user = await currentUser();
  if (!user) return null;
  const db = await createSupabase();
  const { data } = await db.from('leads').select('id, name, contact, business, services, package_code, needs, budget, status, notes, follow_up, created_at').order('created_at', { ascending: false }).limit(200);
  return { owner: user.role === 'owner', leads: (data ?? []).map((l) => ({ id: l.id, name: l.name, contact: l.contact, business: l.business, services: l.services ?? [], packageCode: l.package_code, needs: l.needs, budget: l.budget, status: l.status, notes: l.notes, followUp: l.follow_up, createdAt: when(l.created_at) })) };
}

export type PortalData = { name: string; quotes: { id: string; title: string; total: number; status: string; sentAt: string | null }[]; projects: (Kit & { id: string; name: string; client: string; tasks: { id: string; title: string; stage: string; status: string; due: string | null; preview_url?: string | null; client_feedback?: string | null; client_rounds?: number }[] })[] };
/** Client portal: only the projects of the clients this user belongs to (RLS). No internal comments, files or history. */

const MAT = 'materials:project_materials(id, label, detail, fallback, required, status, note, position, files:project_files(id, name, size))';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mats = (v: any): Material[] => ((v ?? []) as (Material & { position: number })[]).sort((a, b) => a.position - b.position).map(({ position: _p, ...m }) => m);
export type Kit = { template: string | null; materialsDue: string | null; startDate: string | null; materials: Material[] };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const kit = (p: any): Kit => ({ template: p.template ?? null, materialsDue: p.materials_due ?? null, startDate: p.start_date ?? null, materials: mats(p.materials) });

export async function getPortal(): Promise<PortalData | null> {
  const user = await currentUser();
  if (!user) return null;
  const db = await createSupabase();
  const [{ data }, { data: qs }] = await Promise.all([
    db.from('projects').select(`id, name, template, materials_due, start_date, client:clients(name), tasks(id, title, stage, status, due, preview_url, client_feedback, client_rounds), ${MAT}`).order('created_at', { ascending: false }),
    db.from('quotations').select('id, title, total, status, sent_at').in('status', ['sent', 'accepted', 'revision']).order('created_at', { ascending: false }),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const one = (v: any) => (Array.isArray(v) ? v[0] : v);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { name: user.name, quotes: (qs ?? []).map((q) => ({ id: q.id, title: q.title, total: Number(q.total) || 0, status: q.status, sentAt: q.sent_at })), projects: (data ?? []).map((p: any) => ({ id: p.id, name: p.name, client: one(p.client)?.name ?? '', tasks: p.tasks ?? [], ...kit(p) })) };
}

export type Member = { id: string; name: string; role: string; active: boolean };
export async function getTeam(): Promise<{ owner: boolean; meId: string; members: Member[] } | null> {
  const user = await currentUser();
  if (!user) return null;
  const db = await createSupabase();
  const { data } = await db.from('profiles').select('id, full_name, role, active').order('created_at');
  return { owner: user.role === 'owner', meId: user.id, members: (data ?? []).map((p) => ({ id: p.id, name: p.full_name || 'Tanpa nama', role: p.role, active: p.active })) };
}

export type Quote = { id: string; title: string; clientName: string; items: { desc: string; qty: number; price: number }[]; total: number; status: string; notes: string; projectId: string | null; leadId: string | null; createdAt: string; sentAt: string | null };
/** Owner only (RLS). */
export async function getQuotes(): Promise<{ owner: boolean; quotes: Quote[]; leads: { id: string; name: string }[] } | null> {
  const user = await currentUser();
  if (!user) return null;
  const db = await createSupabase();
  const [{ data }, { data: leads }] = await Promise.all([
    db.from('quotations').select('id, title, client_name, items, total, status, notes, project_id, lead_id, created_at, sent_at').order('created_at', { ascending: false }).limit(200),
    db.from('leads').select('id, name').not('status', 'in', '(won,lost)').order('created_at', { ascending: false }).limit(100),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quotes = (data ?? []).map((q: any) => ({ id: q.id, title: q.title, clientName: q.client_name, items: Array.isArray(q.items) ? q.items : [], total: Number(q.total), status: q.status, notes: q.notes, projectId: q.project_id, leadId: q.lead_id, createdAt: when(q.created_at), sentAt: q.sent_at ? when(q.sent_at) : null }));
  return { owner: user.role === 'owner', quotes, leads: leads ?? [] };
}

export type ProjectCard = Kit & { id: string; name: string; client: string; completed: boolean; tasks: { id: string; title: string; stage: string; status: string; due: string | null; pic: string | null }[] };
export async function getProjects(): Promise<{ owner: boolean; people: Record<string, string>; projects: ProjectCard[]; today: string } | null> {
  const user = await currentUser();
  if (!user) return null;
  const db = await createSupabase();
  const [{ data }, { data: profiles }] = await Promise.all([
    db.from('projects').select(`id, name, completed_at, template, materials_due, start_date, client:clients(name), tasks(id, title, stage, status, due, pic), ${MAT}`).order('created_at', { ascending: false }),
    db.from('profiles').select('id, full_name'),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const one = (v: any) => (Array.isArray(v) ? v[0] : v);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = (data ?? []).map((p: any) => ({ id: p.id, name: p.name, client: one(p.client)?.name ?? '—', completed: !!p.completed_at, tasks: p.tasks ?? [], ...kit(p) }));
  const people = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name || 'Anggota']));
  return { owner: user.role === 'owner', people, projects, today: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date()) };
}

export type DashboardData = {
  name: string; owner: boolean; today: string;
  kpi: { projects: number; tasks: number; approvals: number; overdue: number; blocked: number; newLeads: number; quotesOpen: number };
  stages: { id: string; count: number }[];
  due: { id: string; title: string; client: string; due: string; status: string; overdue: boolean }[];
  feed: { at: string; who: string; task: string; text: string }[];
};
/** Dashboard numbers come only from rows the signed-in user is allowed to read (RLS) — no estimates, no fixtures. */
export async function getDashboard(): Promise<DashboardData | null> {
  const ws = await getWorkspace();
  if (!ws) return null;
  const db = await createSupabase();
  const owner = ws.me.role === 'owner';
  const [{ count: projects }, { count: newLeads }, { count: quotesOpen }, { data: hist }] = await Promise.all([
    db.from('projects').select('id', { count: 'exact', head: true }).is('completed_at', null),
    db.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    db.from('quotations').select('id', { count: 'exact', head: true }).in('status', ['draft', 'sent', 'revision']),
    db.from('task_history').select('entry, created_at, actor, task:tasks(title)').order('created_at', { ascending: false }).limit(8),
  ]);
  const active = ws.tasks.filter((t) => t.status !== 'completed');
  const late = (t: (typeof active)[number]) => !!t.due && t.due < ws.today && !['approved', 'published', 'completed'].includes(t.status);
  const names = Object.fromEntries(ws.people.map((p) => [p.id, p.name]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const one = (v: any) => (Array.isArray(v) ? v[0] : v);
  return {
    name: ws.me.name, owner, today: ws.today,
    kpi: { projects: projects ?? 0, tasks: active.length, approvals: active.filter((t) => t.status === 'review').length, overdue: active.filter(late).length, blocked: active.filter((t) => t.status === 'blocked').length, newLeads: newLeads ?? 0, quotesOpen: quotesOpen ?? 0 },
    stages: ['planning', 'prep', 'production', 'editing', 'owner', 'scheduling', 'publishing', 'reporting'].map((id) => ({ id, count: active.filter((t) => t.stage === id).length })),
    due: active.filter((t) => t.due && t.due <= ws.today).slice(0, 8).map((t) => ({ id: t.id, title: t.title, client: t.client, due: t.due!, status: t.status, overdue: late(t) })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    feed: (hist ?? []).map((h: any) => ({ at: when(h.created_at), who: names[h.actor] ?? 'Sistem', task: one(h.task)?.title ?? 'Tugas', text: h.entry })),
  };
}

export type WaitingKit = Kit & { id: string; name: string; client: string };
/** Templated projects whose clock has not started yet (waiting for client materials). Staff only (RLS). */
export async function getWaitingKits(): Promise<WaitingKit[]> {
  const db = await createSupabase();
  const { data } = await db.from('projects').select(`id, name, template, materials_due, start_date, client:clients(name), ${MAT}`).is('completed_at', null).is('start_date', null).not('template', 'is', null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((p: any) => ({ id: p.id, name: p.name, client: (Array.isArray(p.client) ? p.client[0] : p.client)?.name ?? '', ...kit(p) }));
}

export type Note = { id: string; title: string; meta: string; at: string; iso: string; href: string };
const friendly = (entry: string) => {
  const m = /^\w+\/\w+ → (\w+)\/(\w+)(.*)$/.exec(entry);
  if (!m) return entry;
  return `${stageLabel(m[1])} · ${statuses[m[2] as keyof typeof statuses]?.label ?? m[2]}${m[3] ?? ''}`;
};
/** Bell: what changed on MY work (or everything, for the Owner) in the last 14 days, by someone else. Staff only (RLS). */
export async function getNotifications(): Promise<Note[]> {
  const user = await currentUser();
  if (!user || user.role === 'client') return [];
  const db = await createSupabase();
  const since = new Date(Date.now() - 14 * 864e5).toISOString();
  const owner = user.role === 'owner';
  const [{ data: hist }, { data: mats }] = await Promise.all([
    db.from('task_history').select('id, actor, entry, created_at, task:tasks!inner(id, title, pic)').gt('created_at', since).neq('actor', user.id).order('created_at', { ascending: false }).limit(60),
    owner ? db.from('project_materials').select('id, label, status, updated_at, updated_by, project:projects(id, name)').in('status', ['sent']).gt('updated_at', since).order('updated_at', { ascending: false }).limit(20) : Promise.resolve({ data: [] }),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const one = (v: any) => (Array.isArray(v) ? v[0] : v);
  const notes: Note[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const h of (hist ?? []) as any[]) {
    const t = one(h.task);
    if (!t || (!owner && t.pic !== user.id)) continue;
    notes.push({ id: `h${h.id}`, title: t.title, meta: friendly(h.entry), at: when(h.created_at), iso: h.created_at, href: `/os/tasks?task=${t.id}` });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const m of (mats ?? []) as any[]) {
    const pr = one(m.project);
    notes.push({ id: `m${m.id}`, title: `Bahan dari klien: ${m.label}`, meta: `${pr?.name ?? 'Proyek'} · perlu dicek`, at: when(m.updated_at), iso: m.updated_at, href: `/os/projects#p-${pr?.id ?? ''}` });
  }
  return notes.sort((a, b) => b.iso.localeCompare(a.iso)).slice(0, 25);
}
