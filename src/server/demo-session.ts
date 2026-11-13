import 'server-only';
import { cookies } from 'next/headers';
import { DEMO_COOKIE, demoById } from '@/lib/demo-accounts';
import { backendConfigured } from './supabase';

/** The demo account signed in on this browser (demo mode only; always null when a backend is configured). */
export async function demoUser() {
  if (backendConfigured) return null;
  return demoById((await cookies()).get(DEMO_COOKIE)?.value) ?? null;
}
