import { NextResponse, type NextRequest } from 'next/server';
import { backendConfigured, createSupabase } from '@/server/supabase';
import { siteUrl } from '@/content/site';
import { authResultRedirect } from '@/lib/auth-redirect';

const TYPES = ['recovery', 'invite', 'email', 'signup', 'magiclink'] as const;

/**
 * Lands here from the invitation / reset-password email:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery   (or type=invite)
 * Verifies the one-time token, starts the session, then asks the user to choose a password.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token_hash') ?? '';
  const type = req.nextUrl.searchParams.get('type') ?? '';
  const code = req.nextUrl.searchParams.get('code') ?? '';
  // PKCE link (password reset requested from this site): ?code=… → session → choose a new password
  if (backendConfigured && /^[\w-]{10,200}$/.test(code)) {
    const db = await createSupabase();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(authResultRedirect(siteUrl, true));
  }
  if (backendConfigured && /^[\w-]{10,200}$/.test(token) && (TYPES as readonly string[]).includes(type)) {
    const db = await createSupabase();
    const { error } = await db.auth.verifyOtp({ token_hash: token, type: type as (typeof TYPES)[number] });
    if (!error) return NextResponse.redirect(authResultRedirect(siteUrl, true));
  }
  return NextResponse.redirect(authResultRedirect(siteUrl, false));
}
