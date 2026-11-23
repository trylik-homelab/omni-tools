import { expect, test } from '@playwright/test';
import { Jimp } from 'jimp';
import { PDFDocument } from 'pdf-lib';

test(
  'Polish toolbox preserves JSON, image editing and PDF downloads after upgrades',
  { tag: '@scenario:cmwszp6sn01vk3ho39fvsc69u' },
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
      'Żółw'
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

    await page.goto('/pdf/convert-to-pdf');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'sample.png',
      mimeType: 'image/png',
      buffer: png
    });
    const pendingDownload = page.waitForEvent('download', {
      predicate: (download) => download.suggestedFilename() === 'sample.pdf'
    });
    await page.getByText('Pobierz', { exact: true }).click();
    const download = await pendingDownload;
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const pdf = await PDFDocument.load(Buffer.concat(chunks));
    expect(pdf.getPageCount()).toBe(1);
    const size = pdf.getPage(0).getSize();
    expect(size.width / size.height).toBeCloseTo(2);
    expect(errors).toEqual([]);
    expect(externalMonaco).toEqual([]);
  }
);
