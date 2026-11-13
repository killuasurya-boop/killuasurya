import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Backend switch. Without these two public values the site runs in DEMO MODE exactly as before
 * (fixtures, no login). Only the URL and the anon/publishable key are used here — both are designed to
 * be public; data is protected by Row Level Security (supabase/migrations). The service-role key is
 * never used by this app.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const backendConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const STAFF_ROLES = ['owner', 'planner', 'production', 'editor', 'publisher'] as const;
export type AppRole = (typeof STAFF_ROLES)[number] | 'client';

export async function createSupabase() {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => { try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* called from a Server Component: middleware refreshes the session */ } },
    },
  });
}

/** Current user + role (from `profiles`, enforced by RLS). Null when signed out or backend not configured. */
export async function currentUser() {
  if (!backendConfigured) return null;
  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('full_name, role, active').eq('id', user.id).single();
  if (!data?.active) return null;
  return { id: user.id, email: user.email ?? '', name: data.full_name as string, role: data.role as AppRole };
}
