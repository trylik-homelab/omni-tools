import { expect, test } from '@playwright/test';

// BDD scenario for OMNI-9 (vitest 1.6.1 -> 3.2.6 security bump): the Base64
// tool's logic is unit-tested under Vitest, so this checks it still behaves the
// same end to end in a real browser.
test.describe('Base64', { tag: '@scenario:cmwsb9t4r00a13hmscu5t2z3g' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/string/base64');
  });

  test('encodes text to Base64', async ({ page }) => {
    await page.getByTestId('text-input').fill('Hello, World!');

    await expect(page.getByTestId('text-result')).toHaveValue(
      'SGVsbG8sIFdvcmxkIQ=='
    );
  });

  test('decodes Base64 back to text', async ({ page }) => {
    // The site defaults to Polish; accept either language's label. Each example
    // card repeats the options, so take the first match: the real options panel
    // renders before the examples (ToolContent).
    await page
      .getByText(/^(Dekoduj Base64|Base64 Decode)$/)
      .first()
      .click();
    await page.getByTestId('text-input').fill('SGVsbG8sIFdvcmxkIQ==');

    await expect(page.getByTestId('text-result')).toHaveValue('Hello, World!');
  });
});
