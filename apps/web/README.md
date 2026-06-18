# @repo/web

SvelteKit **SPA** product app (`adapter-static`, `ssr: false`, `index.html` fallback). Convex and Clerk run in the browser; the static shell is served from CDN. Locales load on demand via `@repo/utils/i18n`. Auth is optional until `PUBLIC_CONVEX_URL` and `PUBLIC_CLERK_PUBLISHABLE_KEY` are set (`apps/web/.env.local`).

## Dev

From repo root (Convex in a second terminal: `bun run dev:convex`):

```bash
bun run dev:web   # http://localhost:3000
```

Preview production build: `bun run --filter @repo/web preview` → [localhost:4000](http://localhost:4000)

## Build & test

```bash
bun run --filter @repo/web build
bun run --filter @repo/web test
bun run --filter @repo/web e2e
```

Shared packages: `@repo/ui-svelte`, `@repo/utils`, `@repo/tokens`, `@repo/config`. Routes: `src/routes/`. Env: `.env.example` → `.env.local`.

Monorepo commands and CI: [docs/development.md](../../docs/development.md).
