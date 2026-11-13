import { expect, test, type Page } from '@playwright/test';
import { dueFor } from '../../src/lib/templates';

const PW = process.env.LIVE_TEST_PASSWORD ?? 'Lokal-Uji-12345';   // local seed only
async function login(page: Page, who: string, password = PW) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(`${who}@test.local`);
  await page.getByLabel('Kata sandi', { exact: true }).fill(password);
  await expect(async () => { await page.getByRole('button', { name: 'Masuk', exact: true }).click(); await expect(page).not.toHaveURL(/\/login/, { timeout: 4000 }); }).toPass({ timeout: 20000 });
}
const logout = async (page: Page) => { await page.keyboard.press('Escape'); await page.getByRole('button', { name: 'Keluar' }).click(); await expect(page).toHaveURL(/\/login/); };
const openTask = async (page: Page, name: RegExp) => { await page.getByRole('button', { name }).first().click(); return page.getByRole('dialog'); };

test.describe.configure({ mode: 'serial' });

test('signed-out visitors cannot open the workspace or the portal', async ({ page }) => {
  await page.goto('/os/tasks');
  await expect(page).toHaveURL(/\/login\?next=%2Fos%2Ftasks/);
  await page.goto('/portal');
  await expect(page).toHaveURL(/\/login/);
});

test('wrong password is rejected with a generic message', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('surya@test.local');
  await page.getByLabel('Kata sandi', { exact: true }).fill('salah-salah-123');
  await expect(async () => { await page.getByRole('button', { name: 'Masuk', exact: true }).click(); await expect(page.getByText('Login gagal')).toBeVisible({ timeout: 4000 }); }).toPass({ timeout: 20000 });
  await expect(page).toHaveURL(/\/login/);
});

test('public Smart Brief is stored as a lead (with consent)', async ({ page }) => {
  await page.goto('/contact');
  const next = () => page.getByRole('button', { name: 'Lanjutkan' }).click();
  await expect(async () => { await next(); await expect(page.getByText('Nama usaha wajib diisi.')).toBeVisible({ timeout: 1500 }); }).toPass({ timeout: 15000 });
  await page.getByLabel('Nama perusahaan / toko').fill('Toko Uji Live');
  await page.getByLabel('Nama PIC').fill('Budi Uji');
  await page.getByLabel('Kanal kontak pilihan').selectOption('email');
  await page.getByLabel('Email').fill('budi@contoh.id');
  await next(); await expect(page.locator('form h2')).toHaveText('Profil usaha');
  await next();
  await page.locator('label', { hasText: 'Lead' }).first().click(); await next();
  await page.locator('label', { hasText: 'Digital Growth' }).click(); await next();
  await page.getByLabel('Kebutuhan & contoh proyek').fill('Butuh konten Instagram rutin.'); await next();
  await next();
  await page.locator('label', { hasText: 'Saya setuju data ini diproses' }).click(); await next();
  await page.getByRole('button', { name: 'Kirim Brief' }).click();
  await expect(page.getByText(/KS-[A-Z0-9]+/)).toBeVisible();
  await expect(page.getByText('DATA DEMO · tidak terkirim')).toHaveCount(0);
});

test('editor sees only own task and can submit it for approval, but cannot approve', async ({ page }) => {
  await login(page, 'ares');
  await expect(page).toHaveURL(/\/os/);
  await page.goto('/os/tasks');
  await expect(page.getByText('Masuk sebagai')).toContainText('Ares');
  await expect(page.getByRole('button', { name: /Posting uji/ })).toHaveCount(0);          // Bima's task is invisible
  const dlg = await openTask(page, /Video uji — editing/);
  await expect(dlg.getByRole('button', { name: 'Setujui' })).toHaveCount(0);
  await dlg.getByLabel('Potong klip').check();
  await dlg.getByLabel('Tulis komentar').fill('Preview siap direview');
  await dlg.getByRole('button', { name: 'Kirim komentar' }).click();
  await expect(dlg.getByText('Preview siap direview')).toBeVisible();
  await dlg.getByRole('button', { name: 'Kirim untuk approval' }).click();
  await expect(page.getByText('Menunggu approval')).toBeVisible();
  await page.goto('/os/crm');
  await expect(page.getByText('Khusus Owner')).toBeVisible();
  await page.goto('/portal');
  await expect(page).toHaveURL(/\/os/);                                                    // staff are not clients
  await logout(page);
});

test('owner approves, hand-off goes to the publisher, and history is kept', async ({ page }) => {
  await login(page, 'surya');
  // live dashboard: numbers come from the database, no DATA DEMO badge
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Halo,');
  await expect(page.getByText('Perlu keputusan Anda')).toBeVisible();
  await expect(page.getByText('DATA DEMO')).toHaveCount(0);
  await page.goto('/os/content');
  await expect(page.getByRole('region', { name: /Pipeline produksi/ }).getByText('Posting uji — jadwal')).toBeVisible();
  await page.goto('/os/tasks');
  await page.getByRole('tab', { name: /Approval \(1\)/ }).click();
  const dlg = await openTask(page, /Video uji — editing/);
  await expect(dlg.getByText('Preview siap direview')).toBeVisible();
  await dlg.getByRole('button', { name: 'Setujui' }).click();
  await expect(dlg.getByText('Scheduling', { exact: true })).toBeVisible();
  await expect(dlg.getByText(/owner\/review → scheduling\/ready/)).toBeVisible();
  await expect(dlg.getByText(/editing\/progress → owner\/review/)).toBeVisible();
  await page.keyboard.press('Escape');
  // create a task
  await page.getByRole('button', { name: 'Tugas baru' }).click();
  const modal = page.getByRole('dialog', { name: 'Tugas baru' });
  await modal.getByLabel('Judul').fill('Tugas buatan Owner');
  await modal.getByLabel('PIC').selectOption({ label: 'Roby' });
  await modal.getByRole('button', { name: 'Buat tugas' }).click();
  await page.getByRole('tab', { name: /Semua Tugas/ }).click();
  await expect(page.getByRole('button', { name: /Tugas buatan Owner/ })).toBeVisible();
  await page.goto('/os/crm');
  await expect(page.getByText('Budi Uji — Toko Uji Live')).toBeVisible();
  await page.getByLabel('Status').last().selectOption('contacted');
  await expect(page.getByText('Status diperbarui')).toBeVisible();
  await page.goto('/os/team');
  await expect(page.getByText('Roby')).toBeVisible();
  await logout(page);
});

test('publisher cannot mark Published without a link; owner completes', async ({ page }) => {
  await login(page, 'bima');
  await page.goto('/os/tasks');
  let dlg = await openTask(page, /Video uji — editing/);
  await dlg.getByRole('button', { name: 'Mulai kerjakan' }).click();
  await dlg.getByRole('button', { name: 'Tandai terjadwal' }).click();
  const pub = dlg.getByRole('button', { name: 'Tandai Published' });
  await expect(pub).toBeDisabled();
  await dlg.getByLabel(/Tautan publikasi/).fill('https://example.com/p/uji');
  await pub.click();
  await expect(dlg.getByText('Published', { exact: true })).toBeVisible();
  await expect(dlg.getByRole('button', { name: 'Selesaikan' })).toHaveCount(0);
  await logout(page);
  await login(page, 'surya');
  await page.goto('/os/tasks');
  await page.getByRole('tab', { name: /Semua Tugas/ }).click();
  dlg = await openTask(page, /Video uji — editing/);
  await dlg.getByRole('button', { name: 'Selesaikan' }).click();
  await expect(dlg.getByText('Completed', { exact: true })).toBeVisible();
  await logout(page);
});

test('client sees only their own project and is kept out of the workspace', async ({ page }) => {
  await login(page, 'klien');
  await expect(page).toHaveURL(/\/portal/);
  await expect(page.getByText(/Konten Uji A/)).toBeVisible();
  await expect(page.getByText(/Konten Uji B/)).toHaveCount(0);
  await expect(page.getByText('Preview siap direview')).toHaveCount(0);                    // internal comment not exposed
  await page.goto('/os/tasks');
  await expect(page).toHaveURL(/\/portal/);
  await logout(page);
  await page.goto('/portal');
  await expect(page).toHaveURL(/\/login/);
});

test('password reset link lets the user choose a new password and sign in with it', async ({ page, request }) => {
  // Local only: ask the local auth server for a recovery token (what the email would contain).
  const api = process.env.API_URL!, key = process.env.SERVICE_ROLE_KEY!;
  const res = await request.post(`${api}/auth/v1/admin/generate_link`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, data: { type: 'recovery', email: 'ojak@test.local' } });
  const { hashed_token } = await res.json();
  const fresh = `Sandi-Baru-${Date.now()}`;   // must differ from the current password
  await page.goto(`/auth/confirm?token_hash=${hashed_token}&type=recovery`);
  await expect(page).toHaveURL(/\/set-password/);
  await page.getByLabel('Kata sandi baru').fill(fresh);
  await page.getByLabel('Ulangi kata sandi').fill(fresh);
  await expect(async () => { await page.getByRole('button', { name: 'Simpan kata sandi' }).click(); await expect(page).toHaveURL(/\/os/, { timeout: 4000 }); }).toPass({ timeout: 20000 });
  await logout(page);
  await login(page, 'ojak', fresh);
  await expect(page).toHaveURL(/\/os/);
  await page.goto('/auth/confirm?token_hash=tokenpalsu1234567890&type=recovery');
  await expect(page).toHaveURL(/\/forgot-password\?expired=1/);
});

test('lead capture is rate-limited and cannot bypass the gate', async ({ request }) => {
  const api = process.env.API_URL!, anon = process.env.ANON_KEY!;
  const h = { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json' };
  const direct = await request.post(`${api}/rest/v1/leads`, { headers: h, data: { name: 'Spam', contact: '0812000000', consent: true } });
  expect(direct.status(), 'direct insert by anon is refused').toBeGreaterThanOrEqual(400);
  const noConsent = await request.post(`${api}/rest/v1/rpc/submit_lead`, { headers: h, data: { p: { name: 'Budi', contact: '0812000000', consent: false }, p_sender: 'a'.repeat(64) } });
  expect(noConsent.ok()).toBeFalsy();
  const codes: number[] = [];
  for (let i = 0; i < 4; i++) codes.push((await request.post(`${api}/rest/v1/rpc/submit_lead`, { headers: h, data: { p: { name: `Uji ${i}`, contact: '0812000000', consent: true }, p_sender: 'b'.repeat(64) } })).status());
  expect(codes.slice(0, 3).every((c) => c === 200)).toBeTruthy();
  expect(codes[3], '4th lead from the same sender within an hour is refused').toBeGreaterThanOrEqual(400);
  const read = await request.get(`${api}/rest/v1/leads?select=id`, { headers: h });
  expect(read.ok() ? (await read.json()).length : 0, 'anon cannot read leads').toBe(0);
});

test('quotation: draft → approve → client accepts → project; staff cannot see quotations', async ({ page }) => {
  await login(page, 'surya');
  await page.goto('/os/quotations');
  await page.getByRole('button', { name: 'Penawaran baru' }).click();
  const m = page.getByRole('dialog', { name: 'Penawaran baru' });
  await m.getByLabel('Judul penawaran').fill('Paket Konten Uji');
  await m.getByLabel('Nama klien').fill('Klien Penawaran');
  await m.getByLabel('Deskripsi').fill('Produksi 8 konten');
  await m.getByLabel('Qty').fill('8');
  await m.getByLabel('Harga (Rp)').fill('250000');
  await m.getByRole('button', { name: 'Simpan draft' }).click();
  await expect(page.getByText('Total: Rp 2.000.000')).toBeVisible();                       // computed by the database
  await page.getByRole('button', { name: /Setujui & tandai terkirim/ }).click();
  await page.getByRole('button', { name: 'Ya, setujui' }).click();
  await expect(page.getByText('Terkirim ke klien')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ubah' })).toHaveCount(0);                 // items locked after approval
  const pdfHref = (await page.getByRole('link', { name: 'Unduh PDF' }).first().getAttribute('href'))!;
  const pdf = await page.request.get(pdfHref);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toBe('application/pdf');
  expect((await pdf.body()).subarray(0, 4).toString()).toBe('%PDF');
  await page.getByRole('button', { name: 'Klien menerima' }).click();
  await page.getByRole('button', { name: 'Buat proyek' }).click();
  await expect(page.getByRole('link', { name: 'Lihat proyek' })).toBeVisible();
  await page.goto('/os/projects');
  await expect(page.getByText('Klien Penawaran · Paket Konten Uji')).toBeVisible();
  await page.getByRole('link', { name: /Tugas buatan Owner/ }).click();
  await expect(page).toHaveURL(/\/os\/tasks\?task=/);
  await expect(page.getByRole('dialog').getByText('Tugas buatan Owner')).toBeVisible();
  await logout(page);
  await login(page, 'ares');
  await page.goto('/os/quotations');
  await expect(page.getByText('Khusus Owner')).toBeVisible();
  expect((await page.request.get(pdfHref)).status()).toBe(404);                            // RLS: staff cannot read quotations
  await logout(page);
  expect((await page.request.get(pdfHref)).status()).toBe(401);
});

test('template project: client materials gate the clock; client says "sent"; owner starts and deadlines appear', async ({ page }) => {
  await login(page, 'surya');
  await page.goto('/os/projects');
  await page.getByRole('button', { name: 'Proyek baru' }).click();
  await page.getByLabel('Nama klien').fill('Klien Uji A');
  await page.getByLabel('Nama proyek').fill('Landing Uji Acara');
  await page.getByRole('button', { name: 'Buat proyek' }).click();
  const kit = page.locator('[id^="p-"]', { hasText: 'Landing Uji Acara' });
  await expect(kit.getByText(/Jam 3 hari kerja belum berjalan/)).toBeVisible({ timeout: 15000 });
  await expect(kit.getByRole('button', { name: /Mulai hitung/ })).toHaveCount(0);
  const item = (name: RegExp) => kit.getByRole('listitem').filter({ hasText: name });
  for (const n of [/^Tanggal, jam/, /^Tiket/]) { await item(n).getByRole('button', { name: 'Diterima' }).click(); await expect(item(n).getByRole('button', { name: 'Batalkan' })).toBeVisible(); }
  for (const n of [/^Konsep/, /^Rundown/]) { await item(n).getByRole('button', { name: 'Pakai Rencana B' }).click(); await expect(item(n).getByText('Pakai Rencana B', { exact: true })).toBeVisible(); }
  await expect(kit.getByText('4/5 wajib siap')).toBeVisible();
  await logout(page);

  await login(page, 'klien');
  await page.goto('/portal');
  await expect(page.getByText('Bahan yang kami perlukan dari Anda')).toBeVisible();
  const logo = page.getByRole('listitem').filter({ hasText: /^Logo acara/ });
  await logo.getByRole('button', { name: 'Kirim lewat WA/Drive' }).click();
  await logo.getByLabel(/Catatan atau link/).fill('dikirim via WA siang ini');
  await logo.getByRole('button', { name: 'Kirim', exact: true }).click();
  await expect(logo.getByText('Terkirim, menunggu dicek')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Pakai Rencana B' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Keluar' }).click();
  await expect(page).toHaveURL(/\/login/);

  await login(page, 'surya');
  await page.goto('/os');
  await expect(page.getByRole('heading', { name: 'Bahan dari klien' }).first()).toBeVisible();
  await page.goto('/os/projects');
  await expect(item(/^Logo acara/).getByText('Catatan: dikirim via WA siang ini')).toBeVisible();
  await item(/^Logo acara/).getByRole('button', { name: 'Diterima' }).click();
  await kit.getByRole('button', { name: /Mulai hitung 3 hari kerja/ }).click();
  await expect(kit.getByText(/Pengerjaan berjalan/)).toBeVisible({ timeout: 15000 });
  await page.goto('/os/tasks');
  await expect(page.getByText('Ganti Rencana B dengan bahan asli').first()).toBeVisible();
});

test('template sub-task: PIC closes it with "Selesai"; final task goes to the client, who asks a revision then approves', async ({ page }) => {
  // planner finishes a template sub-task without an approval round
  await login(page, 'roby');
  await page.goto('/os/tasks');
  let dlg = await openTask(page, /Struktur halaman & copywriting/);
  await dlg.getByRole('button', { name: 'Mulai kerjakan' }).click();
  await dlg.getByRole('button', { name: 'Selesai', exact: true }).click();
  await expect(dlg.getByText(/→ planning\/completed/)).toBeVisible({ timeout: 15000 });
  await logout(page);

  // owner sends the final task to the client with a preview link
  await login(page, 'surya');
  await page.goto('/os/tasks');
  await page.getByRole('tab', { name: /Semua Tugas/ }).click();
  dlg = await openTask(page, /Cek akhir, approval klien & tayang/);
  await dlg.getByRole('button', { name: 'Mulai kerjakan' }).click();
  await expect(dlg.getByRole('button', { name: 'Kirim ke klien' })).toBeDisabled();
  await dlg.getByLabel(/Link pratinjau untuk klien/).fill('https://pratinjau.contoh.id/acara');
  await dlg.getByRole('button', { name: 'Kirim ke klien' }).click();
  await expect(dlg.getByText('Menunggu persetujuan klien di Portal.')).toBeVisible({ timeout: 15000 });
  await logout(page);

  // client asks for a revision
  await login(page, 'klien');
  await page.goto('/portal');
  const card = page.getByRole('listitem', { name: /Persetujuan: Cek akhir/ });
  await expect(card.getByRole('link', { name: 'Buka pratinjau' })).toHaveAttribute('href', 'https://pratinjau.contoh.id/acara');
  await card.getByRole('button', { name: 'Minta revisi' }).click();
  await card.getByLabel(/Bagian mana yang perlu diubah/).fill('Jam acara salah, harusnya 19.00 WIB.');
  await card.getByRole('button', { name: 'Kirim permintaan revisi' }).click();
  await expect(page.getByText('Perlu persetujuan Anda')).toHaveCount(0, { timeout: 15000 });
  await page.getByRole('button', { name: 'Keluar' }).click();
  await expect(page).toHaveURL(/\/login/);

  // owner sees the note, fixes, sends again; client approves → publisher
  await login(page, 'surya');
  await page.goto('/os/tasks');
  await page.getByRole('tab', { name: /Semua Tugas/ }).click();
  dlg = await openTask(page, /Cek akhir, approval klien & tayang/);
  await expect(dlg.getByText('Jam acara salah, harusnya 19.00 WIB.')).toBeVisible();
  await expect(dlg.getByText(/revisi ke-1/)).toBeVisible();
  await dlg.getByRole('button', { name: 'Mulai kerjakan' }).click();
  await dlg.getByLabel(/Link pratinjau untuk klien/).fill('https://pratinjau.contoh.id/acara-v2');
  await dlg.getByRole('button', { name: 'Kirim ke klien' }).click();
  await expect(dlg.getByText('Menunggu persetujuan klien di Portal.')).toBeVisible({ timeout: 15000 });
  await logout(page);

  await login(page, 'klien');
  await page.goto('/portal');
  await page.getByRole('listitem', { name: /Persetujuan: Cek akhir/ }).getByRole('button', { name: 'Setujui' }).click();
  await expect(page.getByText('Perlu persetujuan Anda')).toHaveCount(0, { timeout: 15000 });
  await page.getByRole('button', { name: 'Keluar' }).click();

  await login(page, 'bima');
  await page.goto('/os');
  await expect(page.getByText('Cek akhir, approval klien & tayang')).toBeVisible();
});

test('client uploads a material file; owner downloads it; another client cannot', async ({ page }) => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  await login(page, 'klien');
  await page.goto('/portal');
  const doc = page.getByRole('listitem').filter({ hasText: /^Dokumen pendukung/ });
  await doc.getByLabel(/Unggah file untuk Dokumen pendukung/).setInputFiles({ name: 'proposal-acara.png', mimeType: 'image/png', buffer: png });
  await expect(doc.getByRole('link', { name: 'proposal-acara.png' })).toBeVisible({ timeout: 20000 });
  await expect(doc.getByText('Terkirim, menunggu dicek')).toBeVisible();
  const href = (await doc.getByRole('link', { name: 'proposal-acara.png' }).getAttribute('href'))!;
  // unsupported type is refused with a clear message
  await page.getByRole('listitem').filter({ hasText: /^Pengisi acara/ }).getByLabel(/Unggah file/).setInputFiles({ name: 'skrip.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('MZ') });
  await expect(page.getByText(/Jenis file belum didukung/)).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Keluar' }).click();
  await expect(page).toHaveURL(/\/login/);

  await login(page, 'surya');
  await page.getByRole('button', { name: /Notifikasi, \d+ baru/ }).click();
  await expect(page.getByRole('link', { name: /Bahan dari klien: Dokumen pendukung/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goto('/os/calendar');
  const start = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  const target = dueFor(start, 3);
  if (target.slice(0, 7) !== start.slice(0, 7)) await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  await page.getByRole('button', { name: new RegExp(`^${Number(target.slice(8))} ${months[Number(target.slice(5, 7)) - 1]}`) }).click();
  await expect(page.getByRole('link', { name: /Target selesai: Landing Uji Acara/ }).first()).toBeVisible();
  const res = await page.request.get(href);
  expect(res.status()).toBe(200);
  expect((await res.body()).subarray(1, 4).toString()).toBe('PNG');
  await logout(page);

  await login(page, 'klien2');
  expect((await page.request.get(href)).status()).toBe(404);
});

test('default Supabase invite link (session in URL hash) lands on "choose a password" and signs the user in', async ({ page, request }) => {
  const api = process.env.API_URL!, key = process.env.SERVICE_ROLE_KEY!;
  const email = `undangan-${Date.now()}@test.local`;
  const res = await request.post(`${api}/auth/v1/admin/generate_link`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, data: { type: 'invite', email, redirect_to: 'http://localhost:3200/' } });
  const { action_link } = await res.json();
  // the verify endpoint redirects to the site with #access_token=…&type=invite (what the e-mail button does)
  const verify = await request.get(action_link, { maxRedirects: 0 });
  const target = verify.headers()['location'];
  expect(target).toContain('#access_token=');
  await page.goto(target.replace(/^https?:\/\/[^/]+/, ''));
  await expect(page).toHaveURL(/\/set-password$/, { timeout: 15000 });
  const pw = `Sandi-Undangan-${Date.now()}`;
  await page.getByLabel('Kata sandi baru').fill(pw);
  await page.getByLabel('Ulangi kata sandi').fill(pw);
  await expect(async () => { await page.getByRole('button', { name: 'Simpan kata sandi' }).click(); await expect(page).toHaveURL(/\/portal/, { timeout: 4000 }); }).toPass({ timeout: 20000 });   // new accounts start as client
});

test('expired / used email link sends the user to request a new one', async ({ page }) => {
  await page.goto('/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired');
  await expect(page).toHaveURL(/\/forgot-password\?expired=1/, { timeout: 15000 });
});
