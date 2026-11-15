/** Destructive integration tests may only use explicitly configured loopback services. */
export function assertLocalTestUrl(value: string | undefined, name: string) {
  if (!value) throw new Error(`${name} wajib diisi dengan URL layanan lokal untuk tes live.`);
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) ||
      !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.username || url.password) {
    throw new Error(`${name} harus mengarah ke localhost; tes live dilarang ke produksi.`);
  }
  return value;
}
