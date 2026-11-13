import { defineConfig, devices } from '@playwright/test';

/**
 * KILLUASURYA.TECH — frontend QA (Phase 10).
 * Run:  npm run build && npm run test:e2e
 * Projects cover the viewport matrix from the master prompt (1440 / 1024 / 768 / 390 / 360).
 */
const PORT = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled' } },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'qa/playwright-report', open: 'never' }], ['json', { outputFile: 'qa/playwright-results.json' }]],
  outputDir: 'qa/test-results',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: `npx next start -p ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: true, timeout: 120_000 },
  // Use the npm scripts (Windows-friendly, no env vars):
  //   test:e2e      → 5 Chromium viewports        test:perf     → perf (1 worker)
  //   test:xbrowser → Firefox + WebKit (desktop & iPhone)
  projects: [
    { name: 'perf', testMatch: /perf\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-1440', testIgnore: /perf\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'laptop-1024', testIgnore: /perf\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } }, grep: /@layout/ },
    { name: 'tablet-768', testIgnore: /perf\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, hasTouch: true }, grep: /@layout|@visual/ },
    { name: 'mobile-390', testIgnore: /perf\.spec\.ts/, use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } }, grep: /@layout|@visual|@mobile|@a11y/ },
    { name: 'mobile-360', testIgnore: /perf\.spec\.ts/, use: { ...devices['Pixel 7'], viewport: { width: 360, height: 780 } }, grep: /@layout/ },
    // Cross-browser: same functional checks, no pixel baselines (font rasterisation differs per engine) and no axe re-run.
    { name: 'firefox-1440', testIgnore: /perf\.spec\.ts/, grepInvert: /@visual|@a11y/, use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit-1440', testIgnore: /perf\.spec\.ts/, grepInvert: /@visual|@a11y/, use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit-iphone', testIgnore: /perf\.spec\.ts/, grep: /@layout|@mobile/, use: { ...devices['iPhone 14'] } },
  ],
});
