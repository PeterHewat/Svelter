# @repo/marketing

SvelteKit **SSG** marketing site (`adapter-static`, `csr: false`). Pre-rendered HTML at build time — no runtime server. Locales live under `/[lang]/` (e.g. `/en`, `/fr/blog`). With JavaScript, `/init.js` redirects `/` to the stored locale (`i18n` localStorage, same as the web app), else the browser language, else `en`; without JavaScript, `/` is a language hub with links to every locale. Theme follows `prefers-color-scheme` in CSS; `/init.js` applies stored overrides and wires the toggle (Zustand-compatible `theme` localStorage).

## Dev

From repo root:

```bash
bun run dev:marketing   # http://localhost:3001
```

Preview production build: `bun run --filter @repo/marketing preview` → [localhost:4001](http://localhost:4001)

## Build & test

```bash
bun run --filter @repo/marketing build
bun run --filter @repo/marketing test
bun run --filter @repo/marketing e2e
```

Shared tokens: `@repo/tokens`. Routes: `src/routes/`.

Monorepo commands and CI: [docs/development.md](../../docs/development.md).
