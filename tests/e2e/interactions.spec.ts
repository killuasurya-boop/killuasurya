import { expect, test } from '@playwright/test';

test.describe('public site', () => {
  test('@mobile header drawer opens, traps focus, closes with Esc', async ({ page }) => {
    await page.goto('/');
    const open = page.getByRole('button', { name: 'Buka menu' });
    await open.click();
    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tutup' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
  });

  test('theme switch changes tokens without layout shift', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const box = await page.locator('h1').boundingBox();
    await page.getByRole('button', { name: 'Buka menu' }).click();
    await page.getByRole('radio', { name: 'Light' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    // body colour cross-fades (--dur-toggle); poll until the transition settles
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(247, 247, 252)');
    await page.keyboard.press('Escape');
    const after = await page.locator('h1').boundingBox();
    expect(Math.abs((after?.y ?? 0) - (box?.y ?? 0))).toBeLessThan(2);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light'); // persisted, no flash back
  });

  test('Smart Brief: validation, consent gate, demo success', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: 'Lanjutkan' }).click();
    await expect(page.getByText('Nama usaha wajib diisi.')).toBeVisible();
    await page.getByLabel('Nama perusahaan / toko').fill('Toko Contoh');
    await page.getByLabel('Nama PIC').fill('Budi');
    await page.getByLabel('Kanal kontak pilihan').selectOption('email');
    await page.getByLabel('Email').fill('salah');
    await page.getByRole('button', { name: 'Lanjutkan' }).click();
    await expect(page.getByText('Format email belum benar.')).toBeVisible();
    await page.getByLabel('Email').fill('budi@contoh.id');
    await page.getByRole('button', { name: 'Lanjutkan' }).click();
    await expect(page.locator('form h2')).toHaveText('Profil usaha');
    await expect(page.getByLabel('Industri')).toBeFocused();
    await page.getByRole('button', { name: 'Lanjutkan' }).click();
    await page.getByRole('button', { name: 'Lanjutkan' }).click();
    await expect(page.getByText('Pilih minimal satu tujuan.')).toBeVisible();
    await page.locator('label', { hasText: 'Lead' }).first().click();
    await page.getByRole('button', { name: 'Lanjutkan' }).click();
    await page.locator('label', { hasText: 'Digital Growth' }).click();
    await page.getByRole('button', { name: 'Lanjutkan' }).click();
    await page.getByLabel('Kebutuhan & contoh proyek').fill('Butuh konten Instagram rutin.');
    await page.getByRole('button', { name: 'Lanjutkan' }).click();
    await page.getByRole('button', { name: 'Lanjutkan' }).click();
    await page.getByRole('button', { name: 'Lanjutkan' }).click();
    await expect(page.getByText(/Persetujuan pemrosesan data diperlukan/)).toBeVisible();
    await page.locator('label', { hasText: 'Saya setuju data ini diproses' }).click();
    await page.getByRole('button', { name: 'Lanjutkan' }).click();
    await page.getByRole('button', { name: 'Kirim Brief' }).click();
    await expect(page.getByText('DATA DEMO · tidak terkirim')).toBeVisible();
    await expect(page.getByText(/DEMO-[A-Z0-9]{5}/)).toBeVisible();
  });

  test('Package Builder hands selection to Smart Brief', async ({ page }) => {
    await page.goto('/build-your-package?package=GROW');
    await expect(page.locator('input[value=GROW]')).toBeChecked();
    await page.locator('label', { hasText: 'Creative Studio' }).first().click();
    await page.getByLabel('Durasi').selectOption('3');
    await page.getByLabel('Kompleksitas').selectOption('mid');
    await page.getByRole('button', { name: 'Ajukan Penawaran' }).click();
    await expect(page).toHaveURL(/\/contact\?package=GROW&services=creative-studio&duration=3&complexity=mid/);
  });

  test('Home quiz recommends a package and hands it to Smart Brief', async ({ page }) => {
    await page.goto('/');
    const quiz = page.locator('#cek-kebutuhan');
    await quiz.scrollIntoViewIfNeeded();
    // options are plain buttons; retry the first click until hydration has attached handlers
    await expect(async () => {
      const first = quiz.getByRole('button', { name: 'Website atau toko online' });
      if (await first.isVisible()) await first.click({ timeout: 1000 }).catch(() => {});
      await expect(quiz.getByText('Pertanyaan 2 dari 3')).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 10000 });
    await quiz.getByRole('button', { name: 'Cafe / Restoran' }).click();
    await quiz.getByRole('button', { name: 'Beberapa cabang atau tim besar' }).click();
    await expect(quiz.getByText('BUILD', { exact: true })).toBeVisible();
    await expect(quiz.getByText(/ENTERPRISE/)).toBeVisible();
    await expect(quiz.getByText(/bukan penawaran/)).toBeVisible();
    await quiz.getByRole('link', { name: /Lanjut konsultasi paket ini/ }).click();
    await expect(page).toHaveURL(/\/contact\?package=BUILD/);
  });

  test('@mobile header: Login Workspace + WhatsApp CTA with the official number', async ({ page }) => {
    await page.goto('/services/website-development');
    await expect(page.locator('header').getByRole('link', { name: 'Login Workspace' })).toHaveAttribute('href', '/login');
    const wa = page.locator('main').getByRole('link', { name: /Konsultasi WhatsApp/ }).first();
    await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/6281396186251\?text=.*Website/);
    await page.getByRole('button', { name: 'Buka menu' }).click();
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Login Workspace' })).toBeVisible();
  });

  test('unknown URL shows the branded 404; /workspace forwards to the demo workspace', async ({ page }) => {
    const res = await page.goto('/halaman-yang-tidak-ada');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'Halaman ini belum ada' })).toBeVisible();
    await page.goto('/workspace');
    await expect(page).toHaveURL(/\/os$/);
  });

  test('login is honest: validates, then reports not connected', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();
    await expect(page.getByText('Masukkan email yang valid.')).toBeVisible();
    await page.getByLabel('Email').fill('owner@contoh.id');
    await page.getByLabel('Kata sandi', { exact: true }).fill('rahasia123');
    await page.getByRole('button', { name: 'Tampilkan kata sandi' }).click();
    await expect(page.getByLabel('Kata sandi', { exact: true })).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();
    await expect(page.getByText('Login gagal', { exact: true })).toBeVisible();   // demo mode: only demo accounts
  });

  test('demo accounts: staff lands in the workspace as that role, client in the portal, logout works', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Akun demo (pratinjau, tanpa backend)').click();
    await page.getByRole('button', { name: /Editing/ }).click();
    await expect(async () => { await page.getByRole('button', { name: 'Masuk', exact: true }).click(); await expect(page).toHaveURL(/\/os\/tasks/, { timeout: 4000 }); }).toPass({ timeout: 20000 });
    await expect(page.getByText('Editing (akun demo)')).toBeVisible();
    await expect(page.getByLabel('Lihat sebagai')).toHaveValue('ares');
    await expect(page.getByText('DATA DEMO').first()).toBeVisible();
    await page.getByRole('button', { name: 'Keluar' }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto('/client/login');
    await page.getByText('Akun demo (pratinjau, tanpa backend)').click();
    await page.getByRole('button', { name: /Klien/ }).first().click();
    await expect(async () => { await page.getByRole('button', { name: 'Masuk', exact: true }).click(); await expect(page).toHaveURL(/\/portal/, { timeout: 4000 }); }).toPass({ timeout: 20000 });
  });

  test('portfolio tabs: arrow keys + filter', async ({ page }) => {
    await page.goto('/portfolio');
    await page.getByRole('tab', { name: 'Semua' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Business System' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('main article')).toHaveCount(2);
  });
});

test.describe('Agency OS', () => {
  test('tasks: approval flow keeps history, publish needs a link, roles see their own work', async ({ page }) => {
    await page.goto('/os/tasks');
    const row = page.getByRole('button', { name: /Video testimoni — approval Owner/ });
    await expect(async () => { await row.click(); await expect(page.getByRole('dialog')).toBeVisible({ timeout: 1000 }); }).toPass({ timeout: 10000 });
    const dlg = page.getByRole('dialog');
    await dlg.getByRole('button', { name: 'Minta revisi' }).click();
    await expect(dlg.getByText('Revision Required')).toBeVisible();
    await expect(dlg.getByText(/Revisi diminta → kembali ke Editing/)).toBeVisible();
    await expect(dlg.getByText('Preview v2 dikirim untuk approval')).toBeVisible(); // earlier history kept
    await page.keyboard.press('Escape');
    // publishing cannot be marked Published without a link
    await page.getByRole('tab', { name: /Semua Tugas/ }).click();
    await page.getByRole('button', { name: /Reels behind the scene/ }).click();
    const pub = page.getByRole('dialog').getByRole('button', { name: 'Tandai Published' });
    await expect(pub).toBeDisabled();
    await page.getByRole('dialog').getByLabel(/Tautan publikasi/).fill('https://example.com/p/demo');
    await expect(pub).toBeEnabled();
    await page.keyboard.press('Escape');
    // non-owner: only own tasks, no approval rights
    await page.getByLabel('Lihat sebagai').selectOption('bima');
    await page.getByRole('tab', { name: /Approval/ }).click();
    await expect(page.getByText('Khusus Owner')).toBeVisible();
  });

  test('Hari Ini: one next-step button per task, owner decides approvals, sample screens tucked away', async ({ page }) => {
    await page.goto('/os');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Halo,');
    await expect(page.getByText('Perlu keputusan Anda')).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Navigasi Agency OS' }).first();
    await expect(nav.getByRole('link', { name: 'Penjualan' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Social Publishing' })).toHaveCount(0);       // collapsed "Pratinjau"
    const approve = page.getByRole('button', { name: 'Setujui', exact: true }).first();
    await expect(async () => { await approve.click({ timeout: 1000 }); await expect(page.getByText(/Disetujui Owner/).first()).toBeVisible({ timeout: 1000 }); }).toPass({ timeout: 10000 });
    await page.getByRole('link', { name: /Video testimoni|Carousel|Reels|Laporan/ }).first().click();
    await expect(page.getByRole('list', { name: 'Posisi di alur kerja' })).toBeVisible();
  });

  test('project template: client materials gate the 3-day clock; Rencana B; start computes the plan', async ({ page, context }) => {
    await page.goto('/os');
    await expect(page.getByRole('heading', { name: 'Bahan dari klien' }).first()).toBeVisible();
    await page.goto('/os/projects');
    const kit = page.locator('#p-KIT-1');
    await expect(kit.getByText(/Jam 3 hari kerja belum berjalan/)).toBeVisible();
    await expect(kit.getByRole('button', { name: /Mulai hitung/ })).toHaveCount(0);
    const item = (name: RegExp) => kit.getByRole('listitem').filter({ hasText: name });
    await expect(async () => { await item(/^Logo acara/).getByRole('button', { name: 'Diterima' }).click({ timeout: 1000 }); await expect(item(/^Logo acara/).getByText('Diterima')).toBeVisible({ timeout: 1000 }); }).toPass({ timeout: 10000 });
    await item(/^Konsep & tema/).getByRole('button', { name: 'Pakai Rencana B' }).click();
    await item(/^Rundown/).getByRole('button', { name: 'Pakai Rencana B' }).click();
    await expect(kit.getByText('5/5 wajib siap')).toBeVisible();
    await kit.getByRole('button', { name: /Mulai hitung 3 hari kerja/ }).click();
    await expect(kit.getByText(/Pengerjaan berjalan/)).toBeVisible();
    await expect(kit.getByText(/Hari 3 · /)).toBeVisible();
    // new project from the template shows what will be created
    await kit.getByRole('button', { name: 'Proyek baru' }).click();
    await expect(page.getByText(/Otomatis dibuat: 10 daftar bahan/)).toBeVisible();
    // client sees the same list in the portal and can say "sent"
    await context.addCookies([{ name: 'ks_demo_user', value: 'klien', url: page.url() }]);
    await page.goto('/portal');
    await expect(page.getByText('Bahan yang kami perlukan dari Anda')).toBeVisible();
    await page.getByRole('button', { name: 'Kirim lewat WA/Drive' }).first().click();
    await page.getByRole('button', { name: 'Kirim', exact: true }).click();
    await expect(page.getByText('Terkirim, menunggu dicek').first()).toBeVisible();
    const rundown = page.getByRole('listitem').filter({ hasText: /^Rundown/ });
    await rundown.getByLabel(/Unggah file untuk Rundown/).setInputFiles({ name: 'rundown.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
    await expect(rundown.getByText('rundown.pdf')).toBeVisible();
    await expect(rundown.getByText('Terkirim, menunggu dicek')).toBeVisible();
  });

  test('quotation PDF downloads (demo, watermarked) and the monthly content template is offered', async ({ page, request }) => {
    const res = await request.get('/api/quotations/QT-00186/pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('application/pdf');
    expect((await res.body()).subarray(0, 4).toString()).toBe('%PDF');
    expect((await request.get('/api/quotations/QT-99999/pdf')).status()).toBe(404);
    await page.goto('/os/quotations');
    await expect(page.getByRole('link', { name: 'Unduh PDF' })).toHaveAttribute('href', /\/api\/quotations\/QT-\d+\/pdf/);
    await page.goto('/os/projects');
    await page.getByRole('button', { name: 'Proyek baru' }).click();
    await page.getByText('Konten Media Sosial Bulanan (20 hari kerja)').click();
    await expect(page.getByText(/Otomatis dibuat: 7 daftar bahan klien \(5 wajib\) \+ 6 tugas/)).toBeVisible();
    await expect(page.getByText(/Hari 20/)).toBeVisible();
  });

  test('calendar is built from the work data: task deadlines + client material deadline; events link to the work', async ({ page }) => {
    await page.goto('/os/calendar');
    await expect(page.getByText('Mode demo: kalender diisi')).toBeVisible();
    await page.getByRole('button', { name: /^13 November/ }).click();
    const ev = page.getByRole('link', { name: /Tenggat bahan: Landing Page Malam Puncak/ }).first();
    await expect(ev).toBeVisible();
    await page.getByRole('button', { name: /^12 November/ }).click();
    await page.getByRole('link', { name: /Reels "Menu Baru"/ }).first().click();
    await expect(page).toHaveURL(/\/os\/tasks\?task=T-201/);
  });

  test('staff demo account sees a short menu and only their own work', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Akun demo (pratinjau, tanpa backend)').click();
    await page.getByRole('button', { name: /Publishing/ }).click();
    await expect(async () => { await page.getByRole('button', { name: 'Masuk', exact: true }).click(); await expect(page).toHaveURL(/\/os/, { timeout: 4000 }); }).toPass({ timeout: 20000 });
    await page.goto('/os');
    const nav = page.getByRole('navigation', { name: 'Navigasi Agency OS' }).first();
    await expect(nav.getByRole('link', { name: 'Tugas Saya' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Penjualan' })).toHaveCount(0);
    await expect(page.getByText('Perlu keputusan Anda')).toHaveCount(0);
    await expect(page.getByText('Feed promo akhir pekan — jadwal')).toBeVisible();
    await expect(page.getByText('Carousel edukasi — editing')).toHaveCount(0);
  });

  test('command palette (Ctrl+K) navigates', async ({ page }) => {
    await page.goto('/os');
    // shortcut listener attaches after hydration — retry the key press until the palette opens
    await expect(async () => {
      await page.keyboard.press('Control+k');
      await expect(page.getByRole('dialog', { name: 'Cari halaman' })).toBeVisible({ timeout: 800 });
    }).toPass({ timeout: 8000 });
    await page.keyboard.type('kalender');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/os\/calendar/);
  });

  test('CRM: drawer, status change, WON guard, empty state', async ({ page }) => {
    await page.goto('/os/crm');
    await page.getByRole('button', { name: 'Detail PT. Delta Inovasi' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Ubah status').selectOption('WON');
    await expect(page.getByText('WON butuh bukti kontrak')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('searchbox', { name: 'Cari lead' }).fill('zzz');
    await expect(page.getByText('Tidak ada lead')).toBeVisible();
  });

  test('quotation approval requires confirmation', async ({ page }) => {
    await page.goto('/os/quotations');
    await page.getByRole('button', { name: 'Approval Owner' }).click();
    await page.getByRole('button', { name: 'Setujui (demo)' }).click();
    await expect(page.getByText('QT-00187 disetujui (demo)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approval Owner' })).toBeDisabled();
  });

  test('kanban: keyboard drag to another column', async ({ page }) => {
    await page.goto('/os/projects');
    const handle = page.getByRole('button', { name: /Seret tugas Website katalog/ });
    // dnd-kit's keyboard sensor attaches on hydration and measures columns asynchronously —
    // retry the whole pick-up → move → drop gesture until the task lands in "Selesai".
    await expect(async () => {
      await page.keyboard.press('Escape');
      await handle.focus();
      await page.keyboard.press('Space');
      await expect(handle).toHaveAttribute('aria-pressed', 'true', { timeout: 700 });
      for (let i = 0; i < 3; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(120); }
      await page.keyboard.press('Space');
      await expect(page.getByText('Dipindah ke Selesai')).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 20000 });
    await expect(page.getByRole('region', { name: /Selesai, 2 tugas/ })).toBeVisible();
  });

  test('WhatsApp: cannot proceed without eligible recipients; send stays disabled', async ({ page }) => {
    await page.goto('/os/whatsapp');
    await page.locator('label', { hasText: 'Leads potensial' }).click();
    await page.getByRole('button', { name: 'Lanjut' }).click();
    await expect(page.getByText(/tidak memenuhi syarat penerima kampanye/)).toBeVisible();
    await page.getByRole('button', { name: 'Lanjut' }).click({ force: true });
    await expect(page.getByText('Tidak ada penerima eligible')).toBeVisible();
  });

  test('publishing retry never fakes success', async ({ page }) => {
    await page.goto('/os/publishing');
    await page.getByRole('button', { name: 'Rekonsiliasi' }).click();
    await expect(page.getByText('Retry tidak dijalankan')).toBeVisible();
    // the flowchart legitimately names the PUBLISHED state; the queue itself must never show it
    await expect(page.getByRole('region', { name: 'Tabel (dapat digeser)' }).getByText(/PUBLISHED|Terbit/)).toHaveCount(0);
  });

  test('integrations never claim to be connected', async ({ page }) => {
    for (const r of ['/os/operations', '/os/settings', '/os/publishing']) {
      await page.goto(r);
      await expect(page.getByText(/^Terhubung$/)).toHaveCount(0);
      await expect(page.getByText('Belum terhubung').first()).toBeVisible();
    }
  });

  test('sidebar collapses to 84px and remembers it', async ({ page }) => {
    await page.goto('/os/settings');
    await page.getByRole('button', { name: 'Ciutkan sidebar' }).click();
    await expect.poll(async () => Math.round((await page.locator('aside').boundingBox())?.width ?? 0)).toBe(84);
    await page.reload();
    await expect.poll(async () => Math.round((await page.locator('aside').boundingBox())?.width ?? 0)).toBe(84);
    await page.getByRole('button', { name: 'Perluas sidebar' }).click();
  });

  test('@mobile bottom nav + drawer on phones', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1440) > 1023, 'mobile only');
    await page.goto('/os');
    await expect(page.getByRole('navigation', { name: 'Navigasi cepat' })).toBeVisible();
    await page.getByRole('button', { name: 'Semua menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Agency OS' })).toBeVisible();
  });
});
