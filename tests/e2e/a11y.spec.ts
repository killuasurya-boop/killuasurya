import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { allRoutes, scrollThrough, setTheme, type Theme } from './helpers';

/** WCAG 2.2 AA target (master prompt §2). serious/critical violations fail; all findings are attached. */
for (const theme of ['dark', 'light'] as Theme[]) {
  for (const route of allRoutes) {
    test(`@a11y axe ${route} (${theme})`, async ({ page }, info) => {
      await setTheme(page, theme);
      await page.emulateMedia({ reducedMotion: 'reduce' }); // final visual state, no in-flight animation colours
      await page.goto(route, { waitUntil: 'load' });
      await scrollThrough(page);
      await page.evaluate(() => scrollTo(0, 0)); // avoid sticky-header overlap artefacts in target-size
      await page.waitForTimeout(300);
      const results = await new AxeBuilder({ page } as unknown as ConstructorParameters<typeof AxeBuilder>[0]).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const summary = results.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
      await info.attach('axe-violations.json', { body: JSON.stringify(summary, null, 2), contentType: 'application/json' });
      const blocking = summary.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(blocking, `serious/critical a11y violations on ${route} (${theme})`).toEqual([]);
    });
  }
}

test('@a11y keyboard: skip link, visible focus, 44px targets on home', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Lewati ke konten' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => { const e = document.activeElement as HTMLElement; const s = getComputedStyle(e); return { w: parseFloat(s.outlineWidth), style: s.outlineStyle, h: e.getBoundingClientRect().height }; });
    expect(outline.style, 'focus outline visible').not.toBe('none');
    expect(outline.w).toBeGreaterThanOrEqual(2);
    expect(outline.h, 'touch target height').toBeGreaterThanOrEqual(44);
  }
});
