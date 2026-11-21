import { expect, test } from '@playwright/test';

// OMNI-7: protobufjs (CVE-2026-41242) reaches this app only through
// onnxruntime-web, which @imgly/background-removal pulls in on this tool.
// The tool's lazy chunk imports that library at module load, so the page
// rendering its own UI with no page errors proves the bumped dependency
// tree still bundles and loads. (The AI model itself is fetched from the
// imgly CDN on first use and is deliberately not exercised here.)
test.describe('Remove background from image', () => {
  test(
    'tool page loads its AI library chunk and renders the upload area',
    { tag: '@scenario:cmwr00o6q00043hpdwn6buitc' },
    async ({ page }) => {
      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      await page.goto('/image-generic/remove-background');

      // Rendered by the lazily loaded component itself, so the chunk loaded.
      await expect(
        page.getByText('Remove Background from Image').first()
      ).toBeVisible();
      await expect(page.locator('input[type="file"]').first()).toBeAttached();

      expect(pageErrors).toEqual([]);
    }
  );
});
