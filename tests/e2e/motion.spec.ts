import { expect, test } from '@playwright/test';

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('hero content is fully visible immediately, no motion pre-state', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/motion-ok/);
    await page.waitForTimeout(150);
    for (const sel of ['h1', '[data-h="sub"]', '[data-h="char"]', '[data-h="bubble"]', '[data-h="cta"]']) {
      const op = await page.locator(sel).first().evaluate((e) => getComputedStyle(e).opacity);
      expect(op, `${sel} opacity`).toBe('1');
    }
  });
});

test.describe('no JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('public pages stay readable without JS', async ({ page }) => {
    for (const r of ['/', '/services', '/pricing', '/portfolio']) {
      await page.goto(r);
      await expect(page.locator('h1')).toBeVisible();
      const op = await page.locator('h1').evaluate((e) => getComputedStyle(e).opacity);
      expect(op, `${r} h1 opacity without JS`).toBe('1');
    }
  });
});

test('hero timeline completes: character, CTAs and underline drawn', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3200);
  await expect.poll(() => page.locator('[data-h="char"]').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
  await expect.poll(() => page.locator('[data-h="cta"]').first().evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
  const offset = await page.locator('[data-h="underline"] path').first().evaluate((e) => parseFloat(getComputedStyle(e).strokeDashoffset || '0'));
  expect(Math.abs(offset)).toBeLessThan(1);
});

test('idle animation pauses when the hero leaves the viewport', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3200);
  const sample = () => page.locator('[data-h="char-idle"]').evaluate((e) => getComputedStyle(e).transform);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(500);
  const a = await sample(); await page.waitForTimeout(600); const b = await sample();
  expect(a, 'idle transform frozen off-screen').toBe(b);
});

test('route switching does not leak (no errors, bounded heap)', async ({ page }) => {
  test.setTimeout(150_000); // 20 client navigations; WebKit is slower under parallel load
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  const heap = () => page.evaluate(() => (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0);
  const cycle = async () => {
    for (const label of ['Layanan', 'Portofolio', 'Pricing', 'Proses']) {
      await page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link', { name: label }).click();
      await page.waitForLoadState('load'); await page.waitForTimeout(700);
      await page.evaluate(() => scrollTo(0, 1200)); await page.waitForTimeout(200);
    }
  };
  test.skip((page.viewportSize()?.width ?? 0) < 1101, 'desktop nav only');
  await cycle();
  const h1 = await heap();
  for (let i = 0; i < 4; i++) await cycle();
  const h2 = await heap();
  test.info().annotations.push({ type: 'heap', description: `${(h1 / 1e6).toFixed(1)}MB → ${(h2 / 1e6).toFixed(1)}MB` });
  expect(errors).toEqual([]);
  expect(h2 - h1, 'heap growth after 4 extra navigation cycles').toBeLessThan(20e6);
});
