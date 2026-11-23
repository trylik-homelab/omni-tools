import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { getBackgroundRemovalAssets } from './background-removal-assets.mjs';

describe('IMG.LY ONNX runtime adapter', () => {
  it('serves both runtime assets from installed ONNX 1.31.1, never the old IMG.LY WASM bundle', () => {
    const { resources, assets } = getBackgroundRemovalAssets();
    expect(assets).toHaveLength(2);
    for (const asset of assets) {
      expect(asset.fileName).toMatch(
        /^background-removal\/onnxruntime-web\/1\.31\.1\/ort-wasm-simd-threaded\.(mjs|wasm)$/
      );
      const key = `/onnxruntime-web/${asset.fileName.split('/').at(-1)}`;
      const resource = resources[key];
      const content = readFileSync(asset.sourcePath);
      expect(resource.size).toBe(content.length);
      expect(resource.chunks).toEqual([
        {
          name: asset.fileName.replace('background-removal/', ''),
          offsets: [0, content.length]
        }
      ]);
    }
  });

  it('retains the existing medium model with contiguous, complete CDN chunks', () => {
    const { resources } = getBackgroundRemovalAssets();
    const model = resources['/models/isnet_fp16'];
    expect(model.size).toBe(88152708);
    let end = 0;
    for (const chunk of model.chunks) {
      expect(chunk.name).toBe(
        `https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/${chunk.hash}`
      );
      expect(chunk.offsets[0]).toBe(end);
      end = chunk.offsets[1];
    }
    expect(end).toBe(model.size);
    expect(
      Object.keys(resources).filter((key) => key.startsWith('/models/'))
    ).toEqual(['/models/isnet_fp16']);
  });
});
