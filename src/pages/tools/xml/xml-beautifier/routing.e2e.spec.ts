import { expect, test } from '@playwright/test';

// planik scenario cmwsbh2c200cm3hmszn3rxz1j (OMNI-10): client-side routing
// keeps working after the react-router / @remix-run/router security bump.
// The window marker proves each step is an in-app navigation, not a reload.
test.describe(
  'Routing: react-router security bump',
  { tag: '@scenario:cmwsbh2c200cm3hmszn3rxz1j' },
  () => {
    test('deep link, breadcrumb link and Back navigate without a reload', async ({
      page
    }) => {
      await page.goto('/xml/xml-beautifier');
      await expect(page.getByTestId('text-input')).toBeVisible();
      await page.evaluate(() => {
        (window as unknown as { __omni10: number }).__omni10 = 1;
      });
      const marker = () =>
        page.evaluate(
          () => (window as unknown as { __omni10?: number }).__omni10
        );

      await page.locator('nav a[href="/categories/xml"]').click();
      await expect(page).toHaveURL(/\/categories\/xml$/);
      expect(await marker()).toBe(1);

      await page.goBack();
      await expect(page).toHaveURL(/\/xml\/xml-beautifier$/);
      await expect(page.getByTestId('text-input')).toBeVisible();
      expect(await marker()).toBe(1);

      await page.getByTestId('text-input').fill('<root><item>1</item></root>');
      await expect(page.getByTestId('text-result')).toHaveValue(
        '<root>\n  <item>1</item>\n</root>\n'
      );
    });
  }
);
