import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextResponse } from 'next/server';
import { authResultRedirect, passwordResetRedirect } from '../../src/lib/auth-redirect';
import { privateAuthResponse } from '../../src/lib/auth-response';
import { assertLocalTestUrl } from '../local-origin';

test('live integration tests refuse production URLs and missing API configuration', () => {
  for (const url of ['http://localhost:54321', 'http://127.0.0.1:3200', 'http://[::1]:3200']) {
    assert.equal(assertLocalTestUrl(url, 'API_URL'), url);
  }
  for (const url of [undefined, 'https://example.supabase.co', 'https://localhost.evil.example', 'file:///tmp/db', 'http://user@localhost']) {
    assert.throws(() => assertLocalTestUrl(url, 'API_URL'));
  }
});

test('reset emails use only the configured origin and a fixed callback', () => {
  assert.equal(passwordResetRedirect('https://killuasurya.tech/path?next=https://evil.example'),
    'https://killuasurya.tech/auth/confirm?next=/set-password');
  assert.equal(passwordResetRedirect('http://localhost:3200'),
    'http://localhost:3200/auth/confirm?next=/set-password');
  for (const origin of ['https://user:pass@example.com', 'http://example.com', 'javascript:alert(1)', '//evil.example']) {
    assert.throws(() => passwordResetRedirect(origin));
  }
});

test('redirects preserve every refreshed cookie and cookie deletion, with private cache headers', () => {
  const session = NextResponse.next();
  session.cookies.set('sb-token.0', 'fresh-0', { httpOnly: true, sameSite: 'lax', secure: true });
  session.cookies.set('sb-token.1', 'fresh-1', { httpOnly: true, sameSite: 'lax', secure: true });
  session.cookies.set('sb-old-token', '', { maxAge: 0 });
  const response = privateAuthResponse(NextResponse.redirect('https://killuasurya.tech/portal'), session);
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), 'https://killuasurya.tech/portal');
  assert.deepEqual(response.cookies.getAll(), session.cookies.getAll());
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('pragma'), 'no-cache');
  assert.equal(response.headers.get('expires'), '0');
});

test('ordinary auth responses also prevent shared caching', () => {
  assert.equal(privateAuthResponse(NextResponse.next()).headers.get('cache-control'), 'private, no-store');
});

test('auth callback results always use the configured public origin and discard token query strings', () => {
  const site = 'https://killuasurya.tech/path?token_hash=should-not-propagate';
  assert.equal(authResultRedirect(site, true).href, 'https://killuasurya.tech/set-password');
  assert.equal(authResultRedirect(site, false).href, 'https://killuasurya.tech/forgot-password?expired=1');
  assert.equal(authResultRedirect('http://localhost:3200', true).href, 'http://localhost:3200/set-password');
  assert.throws(() => authResultRedirect('http://0.0.0.0:3000', false));
});
