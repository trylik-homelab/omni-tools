import { expect, test } from '@playwright/test';

// OMNI-8: tinypool 0.8.4 → 2.1.2 security bump (Vitest's worker pool, a dev
// dependency that never ships to the browser). These scenarios guard that the
// site still builds, serves and runs a client-side tool after the change.
test.describe('ROT13', { tag: '@scenario:cmwsbatnr00b33hms13mc60qi' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/string/rot13');
  });

  test('encodes text with ROT13', async ({ page }) => {
    await page.getByTestId('text-input').fill('Hello, World!');

    await expect(page.getByTestId('text-result')).toHaveValue('Uryyb, Jbeyq!');
  });

  test('applying ROT13 twice returns the original text', async ({ page }) => {
    await page.getByTestId('text-input').fill('Uryyb, Jbeyq!');

    await expect(page.getByTestId('text-result')).toHaveValue('Hello, World!');
  });
});
