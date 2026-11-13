import { NextResponse, type NextRequest } from 'next/server';
import { backendConfigured, createSupabase } from '@/server/supabase';

const TYPES = ['recovery', 'invite', 'email', 'signup', 'magiclink'] as const;

/**
 * Lands here from the invitation / reset-password email:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery   (or type=invite)
 * Verifies the one-time token, starts the session, then asks the user to choose a password.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = url.searchParams.get('token_hash') ?? '';
  const type = url.searchParams.get('type') ?? '';
  const code = url.searchParams.get('code') ?? '';
  url.search = '';
  // PKCE link (password reset requested from this site): ?code=… → session → choose a new password
  if (backendConfigured && /^[\w-]{10,200}$/.test(code)) {
    const db = await createSupabase();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) { url.pathname = '/set-password'; return NextResponse.redirect(url); }
  }
  if (backendConfigured && /^[\w-]{10,200}$/.test(token) && (TYPES as readonly string[]).includes(type)) {
    const db = await createSupabase();
    const { error } = await db.auth.verifyOtp({ token_hash: token, type: type as (typeof TYPES)[number] });
    if (!error) { url.pathname = '/set-password'; return NextResponse.redirect(url); }
  }
  url.pathname = '/forgot-password';
  url.search = '?expired=1';
  return NextResponse.redirect(url);
}
