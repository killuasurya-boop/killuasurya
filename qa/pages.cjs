// Full-page QA across routes, themes and viewports. Usage: node qa/pages.cjs [outDir]
const { chromium } = require('playwright');
const routes = (process.env.ROUTES || '/services,/services/digital-marketing,/portfolio,/case-studies,/pricing,/build-your-package,/contact,/about,/insights,/login,/client/login,/reset-password').split(',');
const widths = (process.env.WIDTHS || '1440,768,390').split(',').map(Number);
const out = process.argv[2] || 'qa/screens';
(async () => {
  const b = await chromium.launch();
  const issues = [];
  for (const theme of (process.env.THEMES || 'dark,light').split(',')) {
    for (const w of widths) {
      const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
      await ctx.addInitScript((t) => localStorage.setItem('theme', t), theme);
      const p = await ctx.newPage();
      p.on('pageerror', (e) => issues.push(`${theme}${w} pageerror ${e.message}`));
      p.on('console', (m) => m.type() === 'error' && !/404|Failed to load resource/.test(m.text()) && issues.push(`${theme}${w} console ${m.text().slice(0, 160)}`));
      for (const r of routes) {
        const res = await p.goto('http://localhost:3100' + r, { waitUntil: 'load', timeout: 60000 });
        if (res.status() >= 400) issues.push(`${theme}${w} ${r} HTTP ${res.status()}`);
        await p.waitForTimeout(1500);
        for (let y = 0; y < 8000; y += 600) { await p.mouse.wheel(0, 600); await p.waitForTimeout(90); }
        await p.waitForTimeout(900);
        const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (ov > 0) issues.push(`${theme}${w} ${r} overflow ${ov}px`);
        const hidden = await p.evaluate(() => [...document.querySelectorAll('main *')].filter((e) => getComputedStyle(e).opacity === '0' && e.getBoundingClientRect().width > 4 && e.getBoundingClientRect().height > 4).length);
        if (hidden) issues.push(`${theme}${w} ${r} ${hidden} elements still opacity 0`);
        await p.screenshot({ path: `${out}/p${r.replace(/\//g, '_')}-${theme}-${w}.png`, fullPage: true });
      }
      await ctx.close();
    }
  }
  await b.close();
  console.log(issues.length ? issues.join('\n') : 'OK: no errors, overflow or stuck-hidden elements');
})();
