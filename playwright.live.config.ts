import { defineConfig, devices } from '@playwright/test';

/**
 * LIVE-mode tests: real login, RLS and workflow against a LOCAL Supabase (`npx supabase start`) seeded with
 * test users. Never point this at production. See docs/BACKEND_SETUP.md → "Uji lokal".
 */
export default defineConfig({
  testDir: './tests/live',
  timeout: 90_000,
  workers: 1,
  reporter: [['list']],
  outputDir: 'qa/test-results-live',
  use: { baseURL: process.env.LIVE_URL ?? 'http://localhost:3200', trace: 'retain-on-failure', ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
});
