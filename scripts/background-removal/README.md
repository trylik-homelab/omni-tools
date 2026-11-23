# Background removal runtime adapter (OMNI-29)

IMG.LY 1.7.0's CDN bundles ONNX Runtime 1.21.0 assets. OMNI uses ONNX 1.31.1,
so `background-removal-assets.mjs` emits the loader and WASM from the installed
npm package and provides an IMG.LY-compatible resource manifest. The dependency
override is valid only together with this adapter and its real inference test.
No model, preprocessing, alpha blending, image dimensions, or PNG output settings
have been changed. The tool explicitly keeps the previous CPU / medium defaults.

`model.json` contains only `/models/isnet_fp16` from:
https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/resources.json
Retrieved 2026-11-23. Chunk names have been made absolute; offsets and model bytes
are unchanged. The model remains downloaded directly from IMG.LY into the browser.
Images stay in memory in the browser and are never uploaded.

The original IS-Net model is credited by IMG.LY to https://github.com/xuebinqin/DIS
(MIT); IMG.LY's package and processing code retain their upstream licensing.

To update either dependency, update the exact package pins and runtime assertion,
review the official model resource manifest, then run the tagged background-removal
inference scenario in all supported browsers. Never point the 1.31 JavaScript at
IMG.LY's original 1.21 WASM/loader bundle.
