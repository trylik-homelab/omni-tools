# AGENTS.md — omni-tools (convert.trylik.pl)

Essential instructions for any agent (Claude Code, Codex, …) working in this repo.
`CLAUDE.md` just imports this file, so keep everything here.

## What this is

Marek's fork of [iib0011/omni-tools](https://github.com/iib0011/omni-tools): a
client-side toolbox (image/video/audio/PDF/text/JSON/CSV/XML/date/math tools).
**Every file is processed in the browser**, and there is no backend. It is served at
**https://convert.trylik.pl** for family and friends, with **Polish as the default language**.

- Repo: `trylik-homelab/omni-tools` (public fork). The upstream remote is `iib0011/omni-tools`.
- Board: planik project **OMNI**: https://planik.trylik.pl (keys `OMNI-<n>`).
- Kucharz floor: `omni-tools`, main desk `main-omni-tools`.
- Public on purpose, with **no auth** (Marek's decision, 2026-06-17). nginx rate limiting is the only guard.

## Stack and layout

React 18 + TypeScript + Vite 5 + MUI 5, i18next, Vitest (happy-dom), Playwright, ESLint 8 + Prettier.
Node 20 in CI and the Dockerfile.

- `src/pages/tools/<category>/<tool>/`: one folder per tool, with `index.tsx` (UI), `meta.ts`
  (`defineTool` registration), `service.ts` (pure logic), and `*.test.ts` / `*.e2e.spec.ts`.
  Each category has an `index.ts` that lists its tools. Add new tools there.
- `src/tools/`: the tool registry (`defineTool.tsx`, `index.ts`). `src/components/`: shared UI.
- `src/i18n/index.ts`: languages, `fallbackLng: 'pl'`, language detection from localStorage only.
- `public/locales/<lang>/<namespace>.json`: translations. **`pl/` is ours** and not upstream's.
- `scripts/create-tool.mjs`: scaffolds a tool. `Dockerfile`: node build → nginx:alpine.
- Path aliases: `@tools/*`, `@components/*`, `@utils/*`, `@assets/*` (see `tsconfig.json`).

## Commands (verified on claude-dev, 2026-09-26)

```bash
npm ci                     # install: 1022 pkgs, ~25s (Node 22 locally works; CI uses 20)
npx vitest run             # unit tests, one-shot: 69 files / 589 tests, ~15s
npm run typecheck          # tsc --noEmit, clean, ~17s
npm run build              # tsc && vite build → dist/ (gitignored), ~50s
npm run serve              # preview dist/ → http://localhost:4173
npm run dev                # vite dev server → http://localhost:5173
```

- **`npm test` is Vitest in WATCH mode** and never exits. Agents use `npx vitest run`
  (add a path to run one tool's tests, e.g. `npx vitest run src/pages/tools/json`).
- **Lint is not clean on `main`, and CI doesn't run it.** `npx eslint src --max-warnings=0` reports
  225 problems, mostly `no-unused-vars` from upstream. `npm run lint` has `--fix` **baked in and
  rewrites files**, so don't run it across `src/`. Lint only the files you touched:
  `npx eslint <files> --max-warnings=0`.
- **`npm run script:create:tool` is broken on Linux.** It rebuilds the absolute path relative to
  the cwd, which creates a stray `./home/…` tree, then crashes with ENOENT. Instead, copy a sibling
  tool folder (e.g. `src/pages/tools/json/minify/`), rename it, and register its `meta.ts` in the
  category `index.ts`. If you do run the script, `rm -rf ./home` afterwards.
- `npx playwright test` (e2e: builds and serves on :4173 itself, three browsers, and needs
  `npx playwright install`) was **not run locally**. It's heavy, and CI runs it. To check one
  tool's e2e, run `npx playwright test <path> --project=chromium`.
- Ports: when you stop a server, free it with `fuser -k 4173/tcp` rather than `pkill -f vite`,
  because `pkill -f` also matches the invoking shell's own command line.

## CI (`.github/workflows/ci.yml`)

Runs on every PR to `main` and on push to `main`. It uses **GitHub-hosted `ubuntu-latest` on purpose**:
the repo is public, and the org's self-hosted runner group blocks public repos (HOMEL-354/355).
Don't move it to `[self-hosted, homelab]`.

- `test-and-build` (`npm run test` + `npm run build`) is **the real gate**.
- `Playwright Tests` is `continue-on-error`. Upstream's image tools flake in headless CI, so it
  shows red without blocking. Don't read a red Playwright job as your regression without checking the report.
- `deploy` (Netlify) is an upstream leftover and a **no-op**: the secrets are unset, and the log
  says "Netlify credentials not provided, not deployable". A green `deploy` does **not** mean shipped.

## Deploy (manual, and not automated)

convert.trylik.pl runs on **ubuntuDocker (192.168.0.247)** as container `omni-tools`, from the
locally built image `omni-tools:trylik`, on port `8092:80`. Caddy (CT 103) proxies the domain to it.
The compose file is `/home/trylik/apps/omni-tools/docker-compose.yml`. It bind-mounts
`default.conf` (the nginx config: SPA fallback, `limit_req` zone `convert`, immutable `/assets/`
caching; see HOMEL-384 for the 429 fix).

**Merging to `main` does not deploy.** The running image was built 2026-06-17, so PRs #1–#4
(Swetrix analytics etc.) are merged but **not live**. A deploy means rebuilding
`omni-tools:trylik` from `main` on ubuntuDocker and `docker compose up -d` in that directory.
Take `homelab-lock acquire ubuntudocker-apps` first and keep the bind-mounted `default.conf`.
SSH credentials: vault item `ubuntuDocker trylik SSH`. No other secrets are involved.

## Conventions

- Conventional commits (`commitlint` config-conventional). The husky pre-commit hook runs `lint-staged` (Prettier).
- Prettier: single quotes, no trailing commas.
- **Translations:** every user-facing string goes through i18next. When you add or change a key in
  `public/locales/en/*.json`, add the **Polish** text to `public/locales/pl/` too, with the same keys
  and `{{placeholders}}`. Other languages may lag behind.
- Keep the fork's customisations when pulling from upstream: the Polish locale and default, the navbar
  with the upstream Discord/GitHub/"Hire me" links removed, and Swetrix analytics in `index.html`
  (`stats.trylik.pl`; the pid is not a secret).
- Tools must stay **client-side only**. Never add a server call that uploads user files.

## Gotchas

- **`gh` defaults to the upstream repo.** Always pass `-R trylik-homelab/omni-tools`
  (`gh pr create -R …`, `gh pr checks -R …`), or you'll open PRs against iib0011's project.
- Local `main` goes stale easily. Run `git pull --ff-only origin main` before branching.
- npm can print `Exit handler never called!` and still **exit 0** with a half-installed
  `node_modules`. Check that `node_modules/.bin/vite` exists before trusting an install.
  `xlsx` resolves from `cdn.sheetjs.com`, not npm, and has failed installs with `EIDLETIMEOUT`.
  It's transient, so just retry `npm ci`.
- `.env.example` has only `LOCIZE_API_KEY`, which the `i18n:*` scripts use for upstream's Locize
  project. We don't use it. Edit the JSON locale files directly.

## Links

- Live site: https://convert.trylik.pl · analytics: https://stats.trylik.pl (Swetrix)
- Board: planik OMNI · framework: `~/.claude/skills/trylik-framework/SKILL.md`
- Homelab CI policy: `~/homelab/CICD_STANDARDS.md` (Runner policy section)
