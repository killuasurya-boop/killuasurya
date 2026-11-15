import { NextResponse } from 'next/server';

/** Preserve refreshed/deleted session cookies when replacing a middleware response with a redirect. */
export function privateAuthResponse(response: NextResponse, session?: NextResponse) {
  if (session) {
    session.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    for (const name of ['Cache-Control', 'Expires', 'Pragma']) {
      const value = session.headers.get(name);
      if (value) response.headers.set(name, value);
    }
  }
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}
