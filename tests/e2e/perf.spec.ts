import { expect, test, type Page } from '@playwright/test';

/** Lab Web Vitals via PerformanceObserver (localhost, Chromium). Field data will differ. */
async function vitals(page: Page, route: string, cpuThrottle = 1) {
  const cdp = await page.context().newCDPSession(page);
  if (cpuThrottle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle });
  await page.addInitScript(() => {
    const w = window as unknown as { __v: { lcp: number; cls: number; longTasks: number; inp: number } };
    w.__v = { lcp: 0, cls: 0, longTasks: 0, inp: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) w.__v.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) w.__v.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { w.__v.longTasks += l.getEntries().length; }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) w.__v.inp = Math.max(w.__v.inp, e.duration); }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
  });
  await page.goto(route, { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  // one realistic interaction for an INP proxy
  const btn = page.getByRole('button', { name: /Buka menu/ }).first();
  if (await btn.isVisible()) { await btn.click(); await page.waitForTimeout(400); await page.keyboard.press('Escape'); }
  await page.waitForTimeout(400);
  const v = await page.evaluate(() => (window as unknown as { __v: Record<string, number> }).__v);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  return v;
}

async function fps(page: Page, ms = 2000) {
  return page.evaluate((dur) => new Promise<{ avg: number; worst: number }>((res) => {
    const t0 = performance.now(); let last = t0; let frames = 0; let worst = 0;
    const tick = (t: number) => { frames++; worst = Math.max(worst, t - last); last = t; if (t - t0 < dur) requestAnimationFrame(tick); else res({ avg: (frames * 1000) / (t - t0), worst }); };
    requestAnimationFrame(tick);
  }), ms);
}

const routes = ['/', '/services', '/contact', '/login', '/os', '/os/projects'];

test.describe('performance', () => {
  test.skip(({ browserName }) => browserName !== 'chromium');
  for (const r of routes) {
    test(`vitals ${r}`, async ({ page }, info) => {
      test.skip(info.project.name !== 'perf', 'desktop lab run');
      const v = await vitals(page, r);
      const t = await vitals(page, r, 4);
      info.annotations.push({ type: 'vitals', description: `LCP ${v.lcp.toFixed(0)}ms · CLS ${v.cls.toFixed(3)} · INP~ ${v.inp.toFixed(0)}ms · longtasks ${v.longTasks} | 4×CPU: LCP ${t.lcp.toFixed(0)}ms · CLS ${t.cls.toFixed(3)} · INP~ ${t.inp.toFixed(0)}ms` });
      await info.attach('vitals.json', { body: JSON.stringify({ route: r, unthrottled: v, cpu4x: t }, null, 2), contentType: 'application/json' });
      expect(v.lcp, 'LCP').toBeLessThan(2500);
      expect(v.cls, 'CLS').toBeLessThan(0.1);
      expect(t.cls, 'CLS (4× CPU)').toBeLessThan(0.1);
      expect(v.inp, 'INP proxy').toBeLessThan(200);
    });
  }

  test('hero animation frame rate', async ({ page }, info) => {
    test.skip(info.project.name !== 'perf', 'desktop lab run');
    await page.goto('/');
    const during = await fps(page, 2500);
    await page.waitForTimeout(500);
    await page.mouse.wheel(0, 900);
    const scroll = await fps(page, 1500);
    info.annotations.push({ type: 'fps', description: `intro avg ${during.avg.toFixed(0)} (worst frame ${during.worst.toFixed(0)}ms) · scroll avg ${scroll.avg.toFixed(0)}` });
    expect(during.avg).toBeGreaterThan(45);
    expect(scroll.avg).toBeGreaterThan(45);
  });
});
