/** Auth emails must use a configured origin, never an incoming Host / X-Forwarded-Host header. */
export function passwordResetRedirect(siteUrl: string) {
  const url = new URL(siteUrl);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password) {
    throw new Error('NEXT_PUBLIC_SITE_URL harus memakai HTTPS (HTTP hanya untuk localhost).');
  }
  return new URL('/auth/confirm?next=/set-password', url.origin).href;
}
