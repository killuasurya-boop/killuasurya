// Read-only release checks. No login attempts, form submissions or production mutations.
const raw = process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL;
if (!raw) { console.error('Usage: npm run check:deployment -- https://staging.example.com'); process.exit(2); }
let url;
try { url = new URL(raw); }
catch { console.error('Provide a valid deployment URL.'); process.exit(2); }
if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
  console.error('Use HTTPS, or HTTP on an explicit loopback host. Do not put credentials in the URL.');
  process.exit(2);
}
const origin = url.origin;
const routes = [
  { path: '/', status: 200 },
  { path: '/login', status: 200 },
  { path: '/os', status: 307, redirect: '/login', private: true },
  { path: '/portal', status: 307, redirect: '/login', private: true },
  { path: '/api/files/invalid', status: 404, private: true },
  { path: '/api/quotations/invalid/pdf', status: 404, private: true },
  { path: '/auth/confirm?token_hash=invalid', status: 307, redirect: '/forgot-password', private: true },
];
const checks = await Promise.all(routes.map(async (route) => {
  const failures = [];
  try {
    const response = await fetch(new URL(route.path, origin), { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if (response.status !== route.status) failures.push(`HTTP ${response.status}, expected ${route.status}`);
    if (response.headers.get('x-content-type-options') !== 'nosniff') failures.push('missing nosniff');
    if (response.headers.get('x-frame-options') !== 'DENY') failures.push('missing frame protection');
    if (response.headers.get('referrer-policy') !== 'strict-origin-when-cross-origin') failures.push('unexpected referrer policy');
    if (route.private && !/\bno-store\b/i.test(response.headers.get('cache-control') ?? '')) failures.push('private response lacks no-store');
    if (route.redirect) {
      const location = response.headers.get('location');
      const next = location ? new URL(location, origin) : null;
      if (!next || next.origin !== origin || next.pathname !== route.redirect) failures.push('unexpected redirect destination');
    }
    await response.body?.cancel();
  } catch (error) {
    const code = /^[A-Z_0-9]+$/.test(error.cause?.code ?? '') ? ` (${error.cause.code})` : '';
    failures.push(error.name === 'TimeoutError' ? 'request timed out' : `request failed${code}`);
  }
  return { route: route.path, passed: failures.length === 0, failures };
}));
console.log(JSON.stringify({ origin, passed: checks.every((c) => c.passed), checks }, null, 2));
if (checks.some((c) => !c.passed)) process.exitCode = 1;
