import { expect, test } from '@playwright/test';
import { Buffer } from 'buffer';
import { Jimp } from 'jimp';

// OMNI-6: jspdf 3.0.3 → 4.2.1 (CVE-2025-68428, CVE-2026-31938).
// This tool is the only jspdf consumer, so it guards the upgrade end to end.

const PX_TO_PT = (0.264583 * 72) / 25.4; // service.ts pxToMm, then mm → pt

async function png(width: number, height: number, color: number) {
  const image = new Jimp({ width, height, color });
  return image.getBuffer('image/png');
}

test.describe('Convert images to PDF tool', () => {
  test.beforeEach(async ({ page }) => {
    // The fork defaults to Polish; pin English so the button labels are stable.
    await page.addInitScript(() => localStorage.setItem('lang', 'en'));
    await page.goto('/pdf/convert-to-pdf');
  });

  test(
    'two images become a two-page PDF the visitor can download',
    { tag: '@scenario:cmwqzrfgl004w3hnahc3933x5' },
    async ({ page }) => {
      await page.locator('input[type="file"]').setInputFiles([
        {
          name: 'landscape.png',
          mimeType: 'image/png',
          buffer: await png(400, 200, 0xff0000ff)
        },
        {
          name: 'portrait.png',
          mimeType: 'image/png',
          buffer: await png(200, 300, 0x0000ffff)
        }
      ]);

      // Headless Chromium (Playwright >= 1.6x) also "downloads" the result
      // preview <iframe> under its blob-URL UUID; skip that one so we catch the
      // Download button's file (OMNI-11).
      const downloadPromise = page.waitForEvent('download', {
        predicate: (d) =>
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/.test(
            d.suggestedFilename()
          )
      });
      await page.getByText('Download', { exact: true }).click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe('merged-images.pdf');

      const chunks: Buffer[] = [];
      for await (const chunk of await download.createReadStream()) {
        chunks.push(chunk as Buffer);
      }
      const pdf = Buffer.concat(chunks).toString('latin1');

      expect(pdf.startsWith('%PDF-')).toBe(true);
      expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true);

      const boxes = [
        ...pdf.matchAll(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/g)
      ].map((m) => [Number(m[1]), Number(m[2])]);
      expect(boxes).toHaveLength(2);

      const expected = [
        [400, 200],
        [200, 300]
      ];
      boxes.forEach(([w, h], i) => {
        expect(w).toBeCloseTo(expected[i][0] * PX_TO_PT, 0);
        expect(h).toBeCloseTo(expected[i][1] * PX_TO_PT, 0);
      });
    }
  );
});
