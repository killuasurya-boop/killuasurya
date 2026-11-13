'use client';

import { useEffect } from 'react';
import { adoptSession } from '@/server/actions/auth';

/**
 * Catches links from Supabase's default emails, which arrive as
 *   /#access_token=…&refresh_token=…&type=invite|recovery   (implicit flow, e.g. "Invite user" from the dashboard)
 *   /?code=…                                                (PKCE flow)
 *   /#error=…&error_description=…                           (expired/used link)
 * and routes them to "Buat kata sandi". Renders nothing; does nothing on normal visits.
 */
export function AuthHashBridge({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const code = new URLSearchParams(window.location.search).get('code');
    if (hash.get('error') || hash.get('error_code')) { window.location.replace('/forgot-password?expired=1'); return; }
    if (code && window.location.pathname === '/') { window.location.replace(`/auth/confirm?code=${encodeURIComponent(code)}&next=/set-password`); return; }
    const access = hash.get('access_token'), refresh = hash.get('refresh_token'), type = hash.get('type') ?? '';
    if (!access || !refresh) return;
    history.replaceState(null, '', window.location.pathname + window.location.search);   // tokens leave the address bar at once
    adoptSession(access, refresh).then((r) => {
      if (!r.ok) window.location.replace('/forgot-password?expired=1');
      else window.location.replace(['invite', 'recovery', 'signup'].includes(type) ? '/set-password' : '/os');
    });
  }, [enabled]);
  return null;
}
