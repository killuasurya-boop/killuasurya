/** Workflow vocabulary shared by the demo fixtures, the UI and the database enums (same ids as supabase/migrations). */
export const stages = [
  { id: 'planning', label: 'Content Planning' },
  { id: 'prep', label: 'Production Preparation' },
  { id: 'production', label: 'Content Production' },
  { id: 'editing', label: 'Editing' },
  { id: 'owner', label: 'Owner Approval' },
  { id: 'client', label: 'Client Approval' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'publishing', label: 'Publishing' },
  { id: 'reporting', label: 'Analytics & Reporting' },
] as const;
export type StageId = (typeof stages)[number]['id'];
export const stageLabel = (id: string) => stages.find((s) => s.id === id)?.label ?? id;

/** V5 smart statuses — label + tone + one-line meaning. Overdue is derived from the deadline, never stored. */
export const statuses = {
  draft: { label: 'Draft', tone: 'muted', hint: 'Belum siap dikerjakan' },
  waiting: { label: 'Waiting', tone: 'muted', hint: 'Menunggu tahap sebelumnya' },
  ready: { label: 'Ready', tone: 'info', hint: 'Siap dikerjakan' },
  progress: { label: 'In Progress', tone: 'purple', hint: 'Sedang dikerjakan' },
  review: { label: 'Review', tone: 'warn', hint: 'Menunggu approval' },
  revision: { label: 'Revision Required', tone: 'bad', hint: 'Perlu diperbaiki' },
  approved: { label: 'Approved', tone: 'good', hint: 'Disetujui' },
  scheduled: { label: 'Scheduled', tone: 'info', hint: 'Sudah dijadwalkan' },
  published: { label: 'Published', tone: 'good', hint: 'Sudah terbit, tautan dicatat' },
  completed: { label: 'Completed', tone: 'good', hint: 'Selesai' },
  blocked: { label: 'Blocked', tone: 'bad', hint: 'Terhambat' },
  overdue: { label: 'Overdue', tone: 'bad', hint: 'Melewati deadline' },
} as const;
export type Status = Exclude<keyof typeof statuses, 'overdue'>;

export const roleLabels: Record<string, string> = { owner: 'Owner', planner: 'Ideation & Planning', production: 'Production Preparation', editor: 'Editing', publisher: 'Publishing', client: 'Klien' };

export type Person = { id: string; name: string; role: string; roleLabel: string; initials: string; color: string };
export type Task = {
  id: string; code: string; title: string; desc: string; client: string; project: string;
  stage: StageId; status: Status; pic: string | null; due: string | null; priority: 'Tinggi' | 'Sedang' | 'Rendah';
  checklist: { id: string; text: string; done: boolean }[];
  files: string[];
  comments: { by: string; text: string; at: string }[];
  history: { at: string; by: string | null; text: string }[];
  publishedUrl?: string | null;
  blocker?: string | null;
  /** Part of a project template (has its own working day). */
  sub?: boolean;
  /** Must be approved by the client in the portal before it moves on. */
  needsClient?: boolean;
  previewUrl?: string | null;
  clientFeedback?: string | null;
  clientRounds?: number;
};
export type TaskAction = 'start' | 'submit' | 'approve' | 'revise' | 'schedule' | 'publish' | 'block' | 'unblock' | 'complete' | 'finish' | 'send_client';

/** Which workflow actions the given person may take (mirrors task_transition() in the database, which is the authority). */
export function availableActions(t: Task, meId: string, isOwner: boolean): TaskAction[] {
  if (!isOwner && t.pic !== meId) return [];
  const a: TaskAction[] = [];
  if (['draft', 'waiting', 'ready', 'revision'].includes(t.status)) a.push('start');
  const early = ['planning', 'prep', 'production', 'editing'].includes(t.stage);
  if (t.status === 'progress' && t.stage === 'scheduling') a.push('schedule');
  else if (t.status === 'progress' && t.stage === 'reporting') { if (isOwner) a.push('complete'); }
  else if (t.status === 'progress' && t.sub && !t.needsClient && early) a.push('finish');
  else if (t.status === 'progress' && t.needsClient && isOwner && early) a.push('send_client');
  else if (t.status === 'progress' && t.stage !== 'publishing' && t.stage !== 'owner') a.push('submit');
  if (t.status === 'scheduled') a.push('publish');
  if (t.status === 'review' && isOwner && t.stage !== 'client') a.push('approve', 'revise', 'send_client');
  if (t.status === 'published' && isOwner) a.push('complete');
  if (['progress', 'ready'].includes(t.status)) a.push('block');
  if (t.status === 'blocked') a.push('unblock');
  return a;
}
export const actionLabels: Record<TaskAction, string> = { start: 'Mulai kerjakan', submit: 'Kirim untuk approval', approve: 'Setujui', revise: 'Minta revisi', schedule: 'Tandai terjadwal', publish: 'Tandai Published', block: 'Tandai Blocked', unblock: 'Buka blokir', complete: 'Selesaikan', finish: 'Selesai', send_client: 'Kirim ke klien' };
export const isUrl = (v: string) => /^https?:\/\/\S+\.\S+/.test(v);
