import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { privateAuthResponse } from '@/lib/auth-response';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const STAFF = ['owner', 'planner', 'production', 'editor', 'publisher'];

/**
 * Route protection for the workspace (/os) and the client portal (/portal).
 * DEMO MODE (no Supabase env): everything stays open and shows fixture data, as before.
 * LIVE MODE: no session → /login; clients can never open /os; staff other than the Owner cannot open /portal.
 * This is the first gate only — the data itself is protected by Row Level Security in the database.
 */
export async function middleware(req: NextRequest) {
  if (!url || !key) return NextResponse.next();

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list, cacheHeaders) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        Object.entries(cacheHeaders).forEach(([name, value]) => res.headers.set(name, value));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;
  const to = (p: string, withNext = false) => { const u = req.nextUrl.clone(); u.pathname = p; u.search = withNext ? `?next=${encodeURIComponent(path)}` : ''; return privateAuthResponse(NextResponse.redirect(u), res); };

  // API handlers authenticate themselves and return 401/404, never HTML login redirects.
  // Auth routes also need refreshed cookies before Server Components read the session.
  const protectedPage = path === '/os' || path.startsWith('/os/') || path === '/portal' || path.startsWith('/portal/');
  if (!protectedPage) return privateAuthResponse(res);

  if (!user) return to('/login', true);
  const { data: profile } = await supabase.from('profiles').select('role, active').eq('id', user.id).single();
  if (!profile?.active) return to('/login');
  const staff = STAFF.includes(profile.role);
  if (path.startsWith('/os') && !staff) return to('/portal');
  if (path.startsWith('/portal') && staff && profile.role !== 'owner') return to('/os');
  return privateAuthResponse(res);
}

export const config = { matcher: ['/os/:path*', '/portal/:path*', '/api/:path*', '/auth/:path*', '/set-password', '/reset-password'] };
