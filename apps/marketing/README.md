# @repo/marketing

SvelteKit **SSG** marketing site (`adapter-static`, `csr: false`). Pre-rendered HTML at build time — no runtime server.

## Dev

From repo root:

```bash
bun run dev:marketing   # http://localhost:4321
```

## Build & test

```bash
bun run --filter @repo/marketing build
bun run --filter @repo/marketing test
bun run --filter @repo/marketing e2e
```

Shared tokens: `@repo/tokens`. Routes: `src/routes/`.

Monorepo commands and CI: [docs/development.md](../../docs/development.md).
