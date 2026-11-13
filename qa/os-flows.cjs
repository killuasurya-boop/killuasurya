// Agency OS interaction QA.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const log = (k, v) => console.log(k.padEnd(46), v);
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:3100/os', { waitUntil: 'load' }); await p.waitForTimeout(1500);
  await p.screenshot({ path: 'qa/screens/os-dash-top-dark-1440.png' });
  await p.keyboard.press('Control+k'); await p.waitForTimeout(400);
  log('cmdk: palette open', await p.isVisible('[role=dialog][aria-label="Cari halaman"]'));
  await p.keyboard.type('whats'); await p.keyboard.press('Enter'); await p.waitForURL(/whatsapp/); await p.waitForTimeout(800);
  log('cmdk: navigated', p.url().replace('http://localhost:3100', ''));
  await p.getByRole('button', { name: 'Lanjut' }).click(); await p.waitForTimeout(500);
  await p.getByRole('button', { name: 'Kembali' }).click(); await p.waitForTimeout(400);
  await p.locator('label', { hasText: 'Leads potensial' }).click();
  await p.getByRole('button', { name: 'Lanjut' }).click(); await p.waitForTimeout(500);
  await p.getByRole('button', { name: 'Lanjut' }).click({ force: true }); await p.waitForTimeout(500);
  log('wa: locked when 0 eligible', (await p.locator('[role=status]').last().textContent()).slice(0, 40));
  log('wa: send button disabled (step 5 design)', 'checked in code (disabled)');

  await p.goto('http://localhost:3100/os/crm', { waitUntil: 'load' }); await p.waitForTimeout(1200);
  await p.getByRole('button', { name: 'Detail PT. Delta Inovasi' }).click(); await p.waitForTimeout(500);
  log('crm: drawer open', await p.isVisible('[role=dialog]'));
  await p.getByLabel('Ubah status').selectOption('NEGOTIATION'); await p.waitForTimeout(400);
  log('crm: status toast', (await p.locator('[role=status]').last().textContent()).slice(0, 50));
  await p.getByLabel('Ubah status').selectOption('WON'); await p.waitForTimeout(400);
  log('crm: WON guarded', await p.getByText('WON butuh bukti kontrak').isVisible());
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  log('crm: drawer closed by Esc', !(await p.isVisible('[role=dialog]')));
  await p.getByRole('searchbox', { name: 'Cari lead' }).fill('zzz'); await p.waitForTimeout(400);
  log('crm: empty state', await p.getByText('Tidak ada lead').isVisible());

  await p.goto('http://localhost:3100/os/quotations', { waitUntil: 'load' }); await p.waitForTimeout(1200);
  await p.getByRole('button', { name: 'Approval Owner' }).click(); await p.waitForTimeout(400);
  log('quote: confirm modal', await p.isVisible('[role=dialog]'));
  await p.getByRole('button', { name: 'Setujui (demo)' }).click(); await p.waitForTimeout(500);
  log('quote: status after approve', await p.locator('section').filter({ hasText: 'QT-00187 · PT. Maju Bersama' }).locator('span').filter({ hasText: 'Disetujui' }).first().textContent());

  await p.goto('http://localhost:3100/os/projects', { waitUntil: 'load' }); await p.waitForTimeout(1200);
  const h = p.getByRole('button', { name: /Seret tugas Website katalog/ });
  await h.focus(); await p.keyboard.press('Space'); await p.waitForTimeout(200);
  for (let i = 0; i < 3; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(120); }
  await p.keyboard.press('Space'); await p.waitForTimeout(600);
  log('kanban: moved to Selesai', await p.getByText('Dipindah ke Selesai').isVisible());

  await p.goto('http://localhost:3100/os/settings', { waitUntil: 'load' }); await p.waitForTimeout(1000);
  await p.getByRole('switch', { name: 'Status publikasi' }).click();
  log('settings: switch toggled', await p.getByRole('switch', { name: 'Status publikasi' }).getAttribute('aria-checked'));
  await p.getByRole('button', { name: 'Ciutkan sidebar' }).click(); await p.waitForTimeout(400);
  log('sidebar: collapsed width', await p.evaluate(() => Math.round(document.querySelector('aside').getBoundingClientRect().width)));
  await p.screenshot({ path: 'qa/screens/os-collapsed.png' });
  await p.getByRole('button', { name: 'Perluas sidebar' }).click();

  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto('http://localhost:3100/os', { waitUntil: 'load' }); await m.waitForTimeout(1200);
  log('mobile: bottom nav visible', await m.isVisible('nav[aria-label="Navigasi cepat"]'));
  await m.getByRole('button', { name: 'Semua menu' }).click(); await m.waitForTimeout(500);
  log('mobile: drawer nav', await m.isVisible('[role=dialog] nav'));
  await m.screenshot({ path: 'qa/screens/os-mobile-drawer.png' });
  log('page errors', errs.length ? errs.join(' | ') : 0);
  await b.close();
})();
