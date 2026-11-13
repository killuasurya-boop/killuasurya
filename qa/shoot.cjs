const { chromium } = require('playwright');
(async () => {
const out = process.argv[2] ?? 'qa/screens';
const b = await chromium.launch();
const errors = [];
for (const theme of ['dark', 'light']) {
  for (const [w, h] of (process.env.QUICK ? [[1440, 900], [390, 844]] : [[1440, 900], [1024, 900], [768, 1024], [390, 844], [360, 780]])) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await ctx.addInitScript((t) => localStorage.setItem('theme', t), theme);
    const p = await ctx.newPage();
    p.on('response', (r) => r.status() >= 400 && errors.push(`${theme}${w}: ${r.status()} ${r.url()}`));
    p.on('pageerror', (e) => errors.push(`${theme}${w}: ${e.message}`));
    await p.goto('http://localhost:3100/', { waitUntil: 'load', timeout: 60000 });
    await p.waitForTimeout(3400);
    await p.screenshot({ path: `${out}/hero-${theme}-${w}.png` });
    if (w === 1440 || w === 390) {
      // scroll through to trigger reveals, then full page
      for (let y = 0; y < 6000; y += 500) { await p.mouse.wheel(0, 500); await p.waitForTimeout(160); }
      await p.waitForTimeout(1200);
      await p.screenshot({ path: `${out}/full-${theme}-${w}.png`, fullPage: true });
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 0) errors.push(`${theme}${w}: horizontal overflow ${overflow}px`);
    }
    await ctx.close();
  }
}
await b.close();
console.log(errors.length ? errors.join('\n') : 'no console errors / overflow');
})();
