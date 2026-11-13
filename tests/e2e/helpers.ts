import { expect, type Page } from '@playwright/test';

export const publicRoutes = ['/', '/services', '/services/digital-marketing', '/services/creative-studio', '/services/website-development', '/services/business-systems', '/services/ai-automation', '/portfolio', '/case-studies', '/pricing', '/build-your-package', '/contact', '/about', '/insights', '/process', '/forgot-password', '/set-password', '/faq', '/privacy', '/terms', '/solusi/cafe-restoran', '/solusi/multi-cabang', '/login', '/client/login', '/reset-password'];
export const osRoutes = ['/os', '/os/overview', '/os/tasks', '/os/operations', '/os/crm', '/os/quotations', '/os/projects', '/os/content', '/os/publishing', '/os/whatsapp', '/os/reports', '/os/calendar', '/os/media', '/os/team', '/os/settings', '/portal'];
export const allRoutes = [...publicRoutes, ...osRoutes];
export type Theme = 'dark' | 'light';

/** Apply theme before any script runs (next-themes reads localStorage 'theme'). */
export async function setTheme(page: Page, theme: Theme) {
  await page.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch { /* noop */ } }, theme);
}

/** Collect real runtime problems; prefetch 404s of not-yet-built routes are not runtime errors. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`); });
  page.on('response', (r) => { if (r.status() >= 500) errors.push(`HTTP ${r.status()} ${r.url()}`); });
  return errors;
}

/** Scroll through the page so ScrollTrigger / whileInView reveals fire, then settle. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(300, innerHeight * 0.7);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)); }
    scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForTimeout(900);
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow, 'horizontal overflow (px)').toBeLessThanOrEqual(0);
}

/** Elements that remained invisible after reveals ran = a broken animation state. */
export async function stuckHidden(page: Page) {
  return page.evaluate(() => [...document.querySelectorAll('main *')].filter((e) => {
    const r = e.getBoundingClientRect();
    return getComputedStyle(e).opacity === '0' && r.width > 4 && r.height > 4;
  }).map((e) => `${e.tagName}.${String((e as HTMLElement).className?.toString?.() ?? '').slice(0, 40)}`));
}
