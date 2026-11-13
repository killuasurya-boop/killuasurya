import { expect, test } from '@playwright/test';
import { allRoutes, expectNoHorizontalOverflow, scrollThrough, setTheme, stuckHidden, trackErrors, type Theme } from './helpers';

for (const theme of ['dark', 'light'] as Theme[]) {
  for (const route of allRoutes) {
    test(`@layout ${route} renders cleanly (${theme})`, async ({ page }) => {
      await setTheme(page, theme);
      const errors = trackErrors(page);
      const res = await page.goto(route, { waitUntil: 'load' });
      expect(res?.status(), 'HTTP status').toBeLessThan(400);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('main#main')).toBeVisible();
      await expect(page.locator('h1').first()).toBeVisible();
      if (route === '/') await page.waitForTimeout(2800); // let the hero intro timeline (≈2.6s) finish
      await scrollThrough(page);
      await expectNoHorizontalOverflow(page);
      // "stuck" = still hidden after entrance timelines had time to finish (slower engines hydrate later)
      await expect.poll(() => stuckHidden(page), { message: 'elements stuck at opacity 0', timeout: 6000 }).toEqual([]);
      expect(errors, 'runtime errors').toEqual([]);
    });
  }
}

test('every route has exactly one h1 and a document title', async ({ page }) => {
  for (const route of allRoutes) {
    await page.goto(route);
    await expect(page.locator('h1'), `${route} h1 count`).toHaveCount(1);
    expect((await page.title()).length, `${route} title`).toBeGreaterThan(5);
  }
});
