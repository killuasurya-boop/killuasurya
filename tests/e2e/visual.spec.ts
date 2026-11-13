import { expect, test } from '@playwright/test';
import { setTheme, type Theme } from './helpers';

/** Visual regression baselines (final animation state). Update intentionally with: npm run test:visual -- --update-snapshots */
const shots = [
  { name: 'home-hero', route: '/' },
  { name: 'services', route: '/services' },
  { name: 'login', route: '/login' },
  { name: 'os-dashboard', route: '/os' },
  { name: 'os-projects', route: '/os/projects' },
];

test.use({ reducedMotion: 'reduce' });
for (const theme of ['dark', 'light'] as Theme[]) {
  for (const s of shots) {
    test(`@visual ${s.name} (${theme})`, async ({ page }) => {
      await setTheme(page, theme);
      await page.goto(s.route, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(600);
      await expect(page).toHaveScreenshot(`${s.name}-${theme}.png`, { fullPage: false, mask: [page.locator('.demo-badge + *').filter({ hasText: /DEMO-/ })] });
    });
  }
}
