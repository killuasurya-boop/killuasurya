/** Auth emails must use a configured origin, never an incoming Host / X-Forwarded-Host header. */
function trustedSiteOrigin(siteUrl: string) {
  const url = new URL(siteUrl);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password) {
    throw new Error('NEXT_PUBLIC_SITE_URL harus memakai HTTPS (HTTP hanya untuk localhost).');
  }
  return url.origin;
}

export function passwordResetRedirect(siteUrl: string) {
  return new URL('/auth/confirm?next=/set-password', trustedSiteOrigin(siteUrl)).href;
}

/** Hosting reverse proxies can expose an internal request origin such as 0.0.0.0:3000. */
export function authResultRedirect(siteUrl: string, verified: boolean) {
  return new URL(verified ? '/set-password' : '/forgot-password?expired=1', trustedSiteOrigin(siteUrl));
}
