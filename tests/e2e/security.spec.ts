import { expect, test } from '@playwright/test';

test('@mobile @layout private endpoints send no-store and defensive headers, including errors', async ({ request }) => {
  for (const path of ['/api/files/invalid', '/api/quotations/invalid/pdf', '/auth/confirm?token_hash=invalid']) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(path.startsWith('/auth') ? 307 : 404);
    expect(response.headers()['cache-control']).toContain('no-store');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect(response.headers()['x-frame-options']).toBe('DENY');
    expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
  }
});

test('@mobile password reset prevents duplicate submissions while pending', async ({ page }) => {
  let submits = 0;
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/forgot-password', async (route) => {
    if (route.request().method() === 'POST') { submits++; await held; }
    await route.continue();
  });
  await page.goto('/forgot-password');
  await page.getByLabel('Email akun').fill('  user@example.com  ');
  const submit = page.getByRole('button', { name: 'Kirim Link Reset' });
  try {
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    await page.getByLabel('Email akun').press('Enter');
    await expect.poll(() => submits).toBe(1);
  } finally { release(); }
  await expect(page.getByText('UI DEMO · tidak terkirim')).toBeVisible();
  expect(submits).toBe(1);
});
