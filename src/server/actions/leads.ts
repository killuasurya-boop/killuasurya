'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { backendConfigured, createSupabase, supabaseUrl } from '../supabase';

export type LeadInput = { name: string; contact: string; business: string; services: string[]; needs: string; budget: string; consent: boolean; packageCode?: string; website?: string; startedAt?: number };
const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

/**
 * Smart Brief → `leads`, through the database gate submit_lead() (consent + rate limits).
 * Anti-spam without third parties: a honeypot field, a minimum fill time, and a per-sender / global hourly cap.
 * The sender is a salted hash of the IP — the raw address is never stored.
 * Returns `demo: true` when no backend is configured, so the UI stays honest.
 */
export async function submitLead(input: LeadInput): Promise<{ ok: boolean; demo: boolean; ref?: string; reason?: 'rate' | 'invalid' | 'error' }> {
  if (!backendConfigured) return { ok: true, demo: true };
  // Bots fill hidden fields and submit instantly: answer "ok" without storing anything.
  if (clip(input.website, 200) || (typeof input.startedAt === 'number' && Date.now() - input.startedAt < 4000)) return { ok: true, demo: false, ref: 'KS-OK' };
  if (input.consent !== true) return { ok: false, demo: false, reason: 'invalid' };
  const row = {
    name: clip(input.name, 120), contact: clip(input.contact, 160), business: clip(input.business, 200),
    services: (Array.isArray(input.services) ? input.services : []).map((s) => clip(s, 60)).filter(Boolean).slice(0, 10),
    package_code: clip(input.packageCode, 20), needs: clip(input.needs, 4000), budget: clip(input.budget, 120), consent: true,
  };
  if (row.name.length < 2 || row.contact.length < 5) return { ok: false, demo: false, reason: 'invalid' };
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
  const sender = createHash('sha256').update(`${process.env.LEAD_HASH_SALT ?? supabaseUrl}|${ip}`).digest('hex');
  const supabase = await createSupabase();
  const { error } = await supabase.rpc('submit_lead', { p: row, p_sender: sender });
  if (error) return { ok: false, demo: false, reason: /rate_limited/.test(error.message) ? 'rate' : 'error' };
  return { ok: true, demo: false, ref: `KS-${Date.now().toString(36).toUpperCase()}` };
}
