import { expect, test } from '@playwright/test';

// OMNI-5: happy-dom 12 → 20 security bump. These scenarios guard that the
// tool behaves the same in a real browser after the dependency change.
test.describe(
  'Crontab Guru',
  { tag: '@scenario:cmwqzxvb9007q3hna50ejyw19' },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/time/crontab-guru');
    });

    test('explains a valid crontab expression', async ({ page }) => {
      await page.getByTestId('text-input').fill('*/5 * * * *');

      await expect(page.getByTestId('text-result')).toHaveValue(
        'Every 5 minutes'
      );
    });

    test('flags an invalid crontab expression', async ({ page }) => {
      await page.getByTestId('text-input').fill('not a cron');

      await expect(page.getByTestId('text-result')).toHaveValue(
        /Invalid crontab expression/
      );
    });
  }
);
