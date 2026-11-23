import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Real inference: do not mock the model or ONNX runtime. Page-load coverage alone
// cannot detect a JavaScript/WASM version mismatch (the OMNI-29 migration risk).
test(
  'removes a photo background with ONNX 1.31.1 without uploading the image',
  { tag: '@scenario:cmwt4u7yn02z53ho30himwdod' },
  async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    const errors: string[] = [];
    const requests: { url: string; method: string }[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (/^https?:/.test(request.url())) {
        requests.push({ url: request.url(), method: request.method() });
      }
    });
    // Analytics is unrelated to the image pipeline; suppress its script so all
    // requests observed during processing can be required to be downloads.
    await page.route('https://swetrix.org/**', (route) =>
      route.fulfill({ contentType: 'text/javascript', body: '' })
    );
    await page.addInitScript(() => localStorage.setItem('lang', 'en'));
    await page.goto('/image-generic/remove-background');
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles(
        fileURLToPath(new URL('./fixtures/astronaut.png', import.meta.url))
      );
    const result = page.getByRole('img', { name: 'Result', exact: true });
    await expect(result).toBeVisible({ timeout: 150_000 });
    await expect(
      page.getByRole('button', { name: 'Download', exact: true })
    ).toBeEnabled();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download', exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('astronaut-no-bg.png');
    const output = await readFile((await download.path())!);
    expect(output.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    );

    const pixels = await page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      let transparent = 0;
      let opaque = 0;
      for (let offset = 3; offset < data.length; offset += 4) {
        if (data[offset] < 16) transparent++;
        if (data[offset] > 240) opaque++;
      }
      return {
        width: canvas.width,
        height: canvas.height,
        transparent,
        opaque,
        // Known foreground (face) and background locations in the NASA photo.
        faceAlpha: data[(120 * canvas.width + 220) * 4 + 3],
        backgroundAlpha: data[(10 * canvas.width + 330) * 4 + 3]
      };
    }, output.toString('base64'));
    expect(pixels.width).toBe(512);
    expect(pixels.height).toBe(512);
    expect(pixels.transparent).toBeGreaterThan(512 * 512 * 0.1);
    expect(pixels.opaque).toBeGreaterThan(512 * 512 * 0.1);
    expect(pixels.faceAlpha).toBeGreaterThan(240);
    expect(pixels.backgroundAlpha).toBeLessThan(16);

    const runtimeRequests = requests.filter(({ url }) =>
      url.includes('/onnxruntime-web/')
    );
    expect(
      runtimeRequests.some(({ url }) =>
        url.endsWith('/1.31.1/ort-wasm-simd-threaded.mjs')
      )
    ).toBe(true);
    expect(
      runtimeRequests.some(({ url }) =>
        url.endsWith('/1.31.1/ort-wasm-simd-threaded.wasm')
      )
    ).toBe(true);
    expect(
      runtimeRequests.every(({ url }) =>
        url.includes('/background-removal/onnxruntime-web/1.31.1/')
      )
    ).toBe(true);
    expect(
      requests.filter(({ method }) => !['GET', 'HEAD'].includes(method))
    ).toEqual([]);
    expect(errors).toEqual([]);
    await testInfo.attach('inference-result', {
      body: output,
      contentType: 'image/png'
    });
    await testInfo.attach('inference-screen', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  }
);
