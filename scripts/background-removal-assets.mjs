import { createReadStream, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const runtimeVersion = '1.31.1';
const assetPrefix = 'background-removal/';

/**
 * IMG.LY 1.7's default resource bundle contains ONNX 1.21 WASM. Its publicPath
 * API lets us keep the original fp16 model and image pipeline while supplying
 * the loader AND WASM from the same installed ONNX build as its JavaScript.
 * https://onnxruntime.ai/docs/tutorials/web/deploy.html
 * https://github.com/imgly/background-removal-js/blob/main/packages/web/src/resource.ts
 */
export function getBackgroundRemovalAssets() {
  const ortDist = dirname(require.resolve('onnxruntime-web'));
  const installedVersion = JSON.parse(
    readFileSync(resolve(ortDist, '../package.json'), 'utf8')
  ).version;
  if (installedVersion !== runtimeVersion) {
    throw new Error(
      `Background removal expects ONNX ${runtimeVersion}, found ${installedVersion}. Update and verify the runtime adapter together with the dependency.`
    );
  }

  const resources = JSON.parse(
    readFileSync(
      new URL('./background-removal/model.json', import.meta.url),
      'utf8'
    )
  );
  const assets = [];
  for (const extension of ['mjs', 'wasm']) {
    const filename = `ort-wasm-simd-threaded.${extension}`;
    const sourcePath = resolve(ortDist, filename);
    const size = statSync(sourcePath).size;
    const name = `onnxruntime-web/${runtimeVersion}/${filename}`;
    const mime = extension === 'wasm' ? 'application/wasm' : 'text/javascript';
    resources[`/onnxruntime-web/${filename}`] = {
      chunks: [{ name, offsets: [0, size] }],
      size,
      mime
    };
    assets.push({ fileName: `${assetPrefix}${name}`, sourcePath, mime });
  }
  return { resources, assets };
}

export default function backgroundRemovalAssets() {
  const { resources, assets } = getBackgroundRemovalAssets();
  const manifest = JSON.stringify(resources);
  let base = '/';
  return {
    name: 'background-removal-onnx-assets',
    configResolved(config) {
      base = config.base;
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url, 'http://localhost').pathname;
        if (pathname === `${base}${assetPrefix}resources.json`) {
          response.setHeader('Content-Type', 'application/json');
          response.end(manifest);
          return;
        }
        const asset = assets.find(
          ({ fileName }) => pathname === `${base}${fileName}`
        );
        if (!asset) return next();
        response.setHeader('Content-Type', asset.mime);
        createReadStream(asset.sourcePath).pipe(response);
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: `${assetPrefix}resources.json`,
        source: manifest
      });
      for (const asset of assets) {
        this.emitFile({
          type: 'asset',
          fileName: asset.fileName,
          source: readFileSync(asset.sourcePath)
        });
      }
    }
  };
}
