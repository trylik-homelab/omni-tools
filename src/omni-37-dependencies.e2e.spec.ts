import { expect, test } from '@playwright/test';
import { Jimp } from 'jimp';

test(
  'OMNI-37 preserves Polish default, cron, JSON and image editing',
  { tag: '@scenario:cmwuizz6b01vu3ho0bkutbw8l' },
  async ({ page }) => {
    const errors: string[] = [];
    const externalMonaco: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (request.url().includes('cdn.jsdelivr.net/npm/monaco-editor')) {
        externalMonaco.push(request.url());
      }
    });
    await page.goto('/');
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('lang')))
      .toBe('pl');

    await page.goto('/time/crontab-guru');
    await page.getByTestId('text-input').fill('*/5 * * * *');
    await expect(page.getByTestId('text-result')).toHaveValue(
      'Every 5 minutes'
    );

    await page.goto('/json/minify');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'input.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{\n  "name": "Żółw",\n  "count": 2\n}')
    });
    await expect(page.getByTestId('text-result')).toHaveValue(
      '{"name":"Żółw","count":2}'
    );
    await expect(page.locator('.monaco-editor .view-lines')).toContainText(
      'Żółw',
      { timeout: 15_000 }
    );

    const png = await new Jimp({
      width: 80,
      height: 40,
      color: 0xff0000ff
    }).getBuffer('image/png');
    await page.goto('/image-generic/editor');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'sample.png',
      mimeType: 'image/png',
      buffer: png
    });
    await expect(page.locator('canvas').first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: /save/i }).first()
    ).toBeVisible();

    expect(errors).toEqual([]);
    expect(externalMonaco).toEqual([]);
  }
);
