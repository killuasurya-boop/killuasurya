'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DEMO_COOKIE, DEMO_PASSWORD, demoAccounts } from '@/lib/demo-accounts';
import { backendConfigured, createSupabase, STAFF_ROLES, type AppRole } from '../supabase';

export type AuthResult = { ok: false; reason: 'not_configured' | 'invalid' | 'inactive' | 'error' | 'demo_invalid' };
const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v) && v.length <= 254;
/** Only same-site relative paths are accepted as a post-login destination. */
const safeNext = (v: unknown) => (typeof v === 'string' && /^\/(os|portal|workspace)(\/[\w\-/]*)?$/.test(v) ? v : null);

export async function signIn(input: { email: string; password: string; next?: string }): Promise<AuthResult> {
  if (!backendConfigured) {
    // DEMO MODE only: fixed demo accounts, a plain role cookie, fixture data. Never reachable in live mode.
    const acc = demoAccounts.find((a) => a.email === String(input.email ?? '').trim().toLowerCase());
    if (!acc || input.password !== DEMO_PASSWORD) return { ok: false, reason: 'demo_invalid' };
    (await cookies()).set(DEMO_COOKIE, acc.id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
    redirect(acc.home);
  }
  const email = String(input.email ?? '').trim().toLowerCase();
  const password = String(input.password ?? '');
  if (!isEmail(email) || password.length < 8 || password.length > 200) return { ok: false, reason: 'invalid' };

  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { ok: false, reason: 'invalid' };   // same message for wrong email or password

  const { data: profile } = await supabase.from('profiles').select('role, active').eq('id', data.user.id).single();
  if (!profile?.active) { await supabase.auth.signOut(); return { ok: false, reason: 'inactive' }; }
  const role = profile.role as AppRole;
  const staff = (STAFF_ROLES as readonly string[]).includes(role);
  const next = safeNext(input.next);
  redirect(staff ? (next && !next.startsWith('/portal') ? next : '/os') : '/portal');
}

export async function signOut() {
  if (backendConfigured) { const supabase = await createSupabase(); await supabase.auth.signOut(); }
  else (await cookies()).delete(DEMO_COOKIE);
  redirect('/login');
}

/** Always answers the same way so the form cannot be used to discover which emails have accounts. */
export async function requestPasswordReset(emailInput: string): Promise<{ sent: boolean; demo: boolean }> {
  if (!backendConfigured) return { sent: false, demo: true };
  const email = String(emailInput ?? '').trim().toLowerCase();
  if (isEmail(email)) {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
    const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
    const supabase = await createSupabase();
    await supabase.auth.resetPasswordForEmail(email, host ? { redirectTo: `${proto}://${host}/auth/confirm?next=/set-password` } : undefined);
  }
  return { sent: true, demo: false };
}

/** Set a new password for the signed-in user (after /auth/confirm). Then send them to their area. */
export async function setPassword(password: string): Promise<{ ok: false; reason: 'not_configured' | 'weak' | 'no_session' | 'error' }> {
  if (!backendConfigured) return { ok: false, reason: 'not_configured' };
  const pw = String(password ?? '');
  if (pw.length < 10 || pw.length > 200) return { ok: false, reason: 'weak' };
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'no_session' };
  const { error } = await supabase.auth.updateUser({ password: pw });
  if (error) return { ok: false, reason: 'error' };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  redirect((STAFF_ROLES as readonly string[]).includes(profile?.role ?? '') ? '/os' : '/portal');
}

const JWT = /^[\w-]+\.[\w-]+\.[\w-]+$/;
/**
 * Default Supabase emails (no custom SMTP yet) land on the site with the session in the URL hash
 * (#access_token=…&refresh_token=…&type=invite|recovery). The browser hands it here once; the server
 * verifies it with Supabase and stores it as a normal HTTP-only session cookie.
 */
export async function adoptSession(access: string, refresh: string): Promise<{ ok: boolean }> {
  if (!backendConfigured || !JWT.test(String(access ?? '')) || !/^[\w-]{6,200}$/.test(String(refresh ?? ''))) return { ok: false };
  const supabase = await createSupabase();
  const { error } = await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
  if (error) return { ok: false };
  const { data: { user } } = await supabase.auth.getUser();
  return { ok: !!user };
}
