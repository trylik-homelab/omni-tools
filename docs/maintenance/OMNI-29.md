# OMNI-29 dependency migration

Marek approved all 47 listed updates, including major migrations, and explicitly
selected migrating background removal to ONNX 1.31.1. The production deployment
uses the documented OMNI Docker deployment under `ubuntudocker-apps`, as approved
on the card; the inherited Netlify job does not deploy convert.trylik.pl.

## Compatibility changes

- Node 24 is the common development, CI and Docker baseline. Use `npm ci` with
  the committed npm lockfile; npm is the package manager used by this repository.
- React 19 and MUI 9 require the new Grid sizing API, slot props and `sx` for
  system styling. Page titles use React's native `<title>` support, replacing
  React Helmet and its React 18-only transitive peer.
- Tailwind 4 uses `@tailwindcss/postcss` and a CSS entry point. Its border base
  preserves the previous default color.
- TypeScript 7 runs the build/typecheck CLI. Microsoft's supported side-by-side
  `@typescript/typescript6` alias supplies the JavaScript compiler API needed by
  typescript-eslint; it is not the build compiler. Paths replace removed `baseUrl`.
- ESLint 10 uses flat configuration. `@eslint-react/eslint-plugin` replaces
  `eslint-plugin-react`, which does not support ESLint 10. The configuration
  retains applicable recommended React checks and the existing project rules.
- The deprecated `@types/react-i18next` stub is removed: react-i18next provides
  its own types. Jimp 1 test fixtures use named imports and its new constructor
  and buffer API. PDF.js worker URLs resolve to the installed worker files.
- Monaco 0.57 pins an older DOMPurify; its override uses the already installed
  patched DOMPurify 3.5 line. IMG.LY's existing Zod 3 advisory remains unchanged
  from the default branch; migrating its schema library is outside these updates.
- A `version.json` build artifact records `COMMIT_SHA` for production verification.
  Docker release builds must pass `--build-arg COMMIT_SHA=<merged commit>`.

## Acceptance coverage

- `@scenario:cmwszp6sn01vk3ho39fvsc69u`: Polish default, JSON minification,
  image-editor controls and a valid PDF download.
- `@scenario:cmwt4u7yn02z53ho30himwdod`: actual browser background inference
  using ONNX 1.31.1 and its matching WASM, yielding a transparent PNG without
  uploading the selected image.

Both scenarios belong to OMNI-29 in Planik. Validation results and the production
commit are recorded in the PR and the card at shipment.
