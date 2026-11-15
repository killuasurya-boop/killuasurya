'use server';

import { revalidatePath } from 'next/cache';
import { templateById } from '@/lib/templates';
import { backendConfigured, createSupabase } from '../supabase';

type R = { ok: true } | { ok: false; error: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIONS = ['start', 'submit', 'approve', 'revise', 'schedule', 'publish', 'block', 'unblock', 'complete', 'finish', 'send_client'];
const STAGES = ['planning', 'prep', 'production', 'editing', 'owner', 'client', 'scheduling', 'publishing', 'reporting'];
const ROLES = ['owner', 'planner', 'production', 'editor', 'publisher', 'client'];
const LEAD = ['new', 'contacted', 'qualified', 'consultation', 'proposal', 'negotiation', 'won', 'lost'];
const fail = (error?: string): R => ({ ok: false, error: error && error.length < 200 ? error : 'Perubahan tidak tersimpan. Coba lagi.' });
/** Every action re-checks input here; WHO may do it is enforced by the database (RLS + task_transition). */
async function run(fn: (db: Awaited<ReturnType<typeof createSupabase>>) => PromiseLike<{ error: { message: string } | null }>, ...paths: string[]): Promise<R> {
  if (!backendConfigured) return fail('Backend belum terhubung.');
  const db = await createSupabase();
  const { error } = await fn(db);
  if (error) return fail(error.message);
  paths.forEach((p) => revalidatePath(p));
  return { ok: true };
}

export async function transitionTask(id: string, action: string, text?: string): Promise<R> {
  if (!UUID.test(id) || !ACTIONS.includes(action)) return fail('Permintaan tidak valid.');
  return run((db) => db.rpc('task_transition', { p_task: id, p_action: action, p_text: text ? String(text).slice(0, 500) : null }), '/os/tasks', '/os', '/os/projects', '/portal');
}
export async function toggleChecklist(itemId: string, done: boolean): Promise<R> {
  if (!UUID.test(itemId)) return fail('Permintaan tidak valid.');
  return run((db) => db.from('task_checklist').update({ done: Boolean(done) }).eq('id', itemId), '/os/tasks');
}
export async function addComment(taskId: string, body: string): Promise<R> {
  const text = String(body ?? '').trim().slice(0, 4000);
  if (!UUID.test(taskId) || !text) return fail('Komentar kosong.');
  return run((db) => db.from('task_comments').insert({ task_id: taskId, body: text }), '/os/tasks');
}
export async function reassignTask(taskId: string, pic: string): Promise<R> {
  if (!UUID.test(taskId) || !UUID.test(pic)) return fail('Permintaan tidak valid.');
  return run((db) => db.from('tasks').update({ pic }).eq('id', taskId), '/os/tasks');
}
export async function createTask(input: { title: string; description: string; projectId: string; newClient: string; newProject: string; stage: string; pic: string; due: string; priority: number; checklist: string }): Promise<R> {
  const title = String(input.title ?? '').trim().slice(0, 200);
  if (title.length < 2 || !STAGES.includes(input.stage) || !UUID.test(input.pic)) return fail('Judul, tahap, dan PIC wajib diisi.');
  if (input.due && !/^\d{4}-\d{2}-\d{2}$/.test(input.due)) return fail('Tanggal tidak valid.');
  const items = String(input.checklist ?? '').split('\n').map((s) => s.trim().slice(0, 200)).filter(Boolean).slice(0, 20);
  return run((db) => db.rpc('create_task_with_checklist', {
    p_project: UUID.test(input.projectId) ? input.projectId : null,
    p_new_client: String(input.newClient ?? ''), p_new_project: String(input.newProject ?? ''),
    p_title: title, p_description: String(input.description ?? '').slice(0, 4000), p_stage: input.stage,
    p_pic: input.pic, p_due: input.due || null, p_priority: [1, 2, 3].includes(input.priority) ? input.priority : 2,
    p_checklist: items,
  }), '/os/tasks', '/os/projects', '/os', '/portal');
}

export async function updateLead(id: string, patch: { status?: string; notes?: string; followUp?: string | null }): Promise<R> {
  if (!UUID.test(id)) return fail('Permintaan tidak valid.');
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) { if (!LEAD.includes(patch.status)) return fail('Status tidak valid.'); row.status = patch.status; }
  if (patch.notes !== undefined) row.notes = String(patch.notes).slice(0, 4000);
  if (patch.followUp !== undefined) { if (patch.followUp && !/^\d{4}-\d{2}-\d{2}$/.test(patch.followUp)) return fail('Tanggal tidak valid.'); row.follow_up = patch.followUp || null; }
  return run((db) => db.from('leads').update(row).eq('id', id), '/os/crm');
}
export async function updateMember(id: string, patch: { role?: string; active?: boolean; name?: string }): Promise<R> {
  if (!UUID.test(id)) return fail('Permintaan tidak valid.');
  const row: Record<string, unknown> = {};
  if (patch.role !== undefined) { if (!ROLES.includes(patch.role)) return fail('Peran tidak valid.'); row.role = patch.role; }
  if (patch.active !== undefined) row.active = Boolean(patch.active);
  if (patch.name !== undefined) row.full_name = String(patch.name).trim().slice(0, 120);
  return run((db) => db.from('profiles').update(row).eq('id', id), '/os/team', '/os/tasks');
}

const QUOTE = ['draft', 'sent', 'accepted', 'revision', 'rejected'];
type Item = { desc: string; qty: number; price: number };
const cleanItems = (items: unknown): Item[] => (Array.isArray(items) ? items : []).slice(0, 50)
  .map((i) => ({ desc: String(i?.desc ?? '').trim().slice(0, 200), qty: Math.max(0, Math.min(1e6, Number(i?.qty) || 0)), price: Math.max(0, Math.min(1e12, Number(i?.price) || 0)) }))
  .filter((i) => i.desc);

/** Create or update a quotation (Owner; RLS). The total is recomputed by the database trigger. */
export async function saveQuote(input: { id?: string; title: string; clientName: string; leadId?: string; notes: string; items: Item[] }): Promise<R> {
  const title = String(input.title ?? '').trim().slice(0, 160);
  const clientName = String(input.clientName ?? '').trim().slice(0, 120);
  if (title.length < 2 || clientName.length < 2) return fail('Judul dan nama klien wajib diisi.');
  const row = { title, client_name: clientName, notes: String(input.notes ?? '').slice(0, 2000), items: cleanItems(input.items), lead_id: input.leadId && UUID.test(input.leadId) ? input.leadId : null };
  if (input.id) { if (!UUID.test(input.id)) return fail('Permintaan tidak valid.'); return run((db) => db.from('quotations').update(row).eq('id', input.id!), '/os/quotations'); }
  return run((db) => db.from('quotations').insert(row), '/os/quotations');
}
export async function setQuoteStatus(id: string, status: string): Promise<R> {
  if (!UUID.test(id) || !QUOTE.includes(status)) return fail('Permintaan tidak valid.');
  return run((db) => db.from('quotations').update({ status }).eq('id', id), '/os/quotations');
}
export async function quoteToProject(id: string): Promise<R> {
  if (!UUID.test(id)) return fail('Permintaan tidak valid.');
  return run((db) => db.rpc('quotation_to_project', { p_quote: id }), '/os/quotations', '/os/projects', '/os/tasks', '/os/crm');
}
export async function newProject(client: string, project: string): Promise<R> {
  return run((db) => db.rpc('create_project', { p_client: String(client ?? ''), p_project: String(project ?? '') }), '/os/projects', '/os/tasks');
}
export async function setProjectCompleted(id: string, completed: boolean): Promise<R> {
  if (!UUID.test(id)) return fail('Permintaan tidak valid.');
  return run((db) => db.from('projects').update({ completed_at: completed ? new Date().toISOString() : null }).eq('id', id), '/os/projects', '/os/tasks', '/portal');
}

// ---------- project templates & client materials (0004) ----------
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MSTATUS = ['missing', 'sent', 'received', 'fallback'];
/** Owner: project + materials + plan tasks (waiting, no deadline yet — the clock starts in project_start()). */
export async function newProjectFromTemplate(client: string, project: string, templateId: string, materialsDue: string): Promise<R> {
  const tpl = templateById(templateId);
  if (!tpl) return newProject(client, project);
  if (materialsDue && !DATE.test(materialsDue)) return fail('Tanggal tidak valid.');
  return run((db) => db.rpc('create_project_with_template', {
    p_client: String(client ?? ''), p_project: String(project ?? ''), p_template: tpl.id,
    p_materials_due: materialsDue || null, p_materials: tpl.materials, p_plan: tpl.plan,
  }), '/os/projects', '/os/tasks', '/os', '/portal');
}
export async function setMaterial(id: string, status: string): Promise<R> {
  if (!UUID.test(id) || !MSTATUS.includes(status)) return fail('Permintaan tidak valid.');
  return run((db) => db.from('project_materials').update({ status }).eq('id', id), '/os/projects', '/os', '/portal');
}
export async function markMaterialSent(id: string, note: string): Promise<R> {
  if (!UUID.test(id)) return fail('Permintaan tidak valid.');
  return run((db) => db.rpc('material_mark_sent', { p_id: id, p_note: String(note ?? '').trim().slice(0, 500) }), '/portal', '/os/projects', '/os');
}
export async function startProject(id: string, start: string): Promise<R> {
  if (!UUID.test(id) || !DATE.test(start)) return fail('Permintaan tidak valid.');
  return run((db) => db.rpc('project_start', { p_project: id, p_start: start }), '/os/projects', '/os/tasks', '/os', '/portal');
}

/** Client (portal): approve, or ask for a revision with a note. Membership + state are checked in client_decide(). */
export async function clientDecide(taskId: string, decision: 'approve' | 'revise', note: string): Promise<R> {
  if (!UUID.test(taskId) || !['approve', 'revise'].includes(decision)) return fail('Permintaan tidak valid.');
  const text = String(note ?? '').trim().slice(0, 2000);
  if (decision === 'revise' && text.length < 5) return fail('Tuliskan bagian yang perlu direvisi.');
  return run((db) => db.rpc('client_decide', { p_task: taskId, p_decision: decision, p_text: text }), '/portal', '/os', '/os/tasks', '/os/projects');
}
