# AGENTS.md

> **Claude Code:** [CLAUDE.md](./CLAUDE.md) is a symlink to this file. `bunx convex ai-files install` updates the marked Convex section below in both paths — do not quote those marker strings elsewhere in this file.

## Agent behavior

- Execute with tools; stay concise (1–3 sentences unless the user wants detail)
- Gather context from the codebase before asking questions; product criteria: [docs/spec/](docs/spec/)
- Prefer editing existing files; JSDoc (`@param`, `@returns`, `@example`) on exported functions and components
- No secrets in code or logs; no `git add` / `commit` / `push` / `reset` unless the user asks
- Reference code as `path:line`; run the [verify gate](#verify-gate) before finishing

## Project conventions

- Merge Tailwind with `cn()` from `@repo/utils` — not raw `clsx` / `twMerge`
- **Tailwind v4** — see [Tailwind v4](#tailwind-v4) (semantic tokens, canonical class names; no v3 utilities)
- **Env (three layers):** `loadWebEnv` in `apps/web/src/lib/web-env.ts`; `requireEnv` in `convex/lib/env.ts` for Convex dashboard vars — never `process.env` in app code; do not import `@repo/utils` from Convex. See [docs/monorepo-structure.md](docs/monorepo-structure.md).
- Prefer `@repo/utils/*` subpaths (`/env`, `/theme`, `/i18n`, …) over the root barrel
- Server state: `convex-svelte` `useQuery` / `useConvexClient().mutation` — not `useEffect` + `fetch`
- Root `package.json` `overrides`: keep [docs/dependency-overrides.md](docs/dependency-overrides.md) in sync when pins change

## Tailwind v4

This repo uses **Tailwind CSS v4** (`@import "tailwindcss"` + `@theme` in each app's `app.css`). Do not use v3 class names.

- **Semantic tokens** from `@theme`: `bg-background`, `text-foreground`, `border-border`, `bg-muted`, `text-muted-foreground`, `bg-card`, `bg-primary`, `ring-ring`, etc. — not raw colors or arbitrary hex.
- **Gradients:** `bg-linear-to-*` (e.g. `bg-linear-to-br`), not `bg-gradient-to-*`.
- **Aspect ratio:** `aspect-16/10`, not `aspect-[16/10]`; prefer `@theme` tokens like `aspect-video` when they fit.
- **Shrink/grow:** `shrink-0` / `grow`, not `flex-shrink-0` / `flex-grow`.
- **Before adding classes:** grep existing components (`packages/utils/src/chrome.ts`, `packages/ui-svelte/`) and match their patterns.
- **After editing `.svelte` / `.css`:** if IntelliSense warns "can be written as …", use the suggested canonical form before finishing.

## Dependency source (opensrc)

When SvelteKit, Svelte 5 runes, or library internals are unclear from types or docs, search the package source via the root devDependency:

```bash
rg "pattern" $(bunx opensrc path svelte)
rg "pattern" $(bunx opensrc path @sveltejs/kit)
```

Common targets: `svelte`, `@sveltejs/kit`, `@sveltejs/adapter-static`, `convex-svelte`. First use fetches and caches under `~/.opensrc/`; version resolves from `node_modules`.

## Two SvelteKit apps — do not conflate modes

| App       | Path             | `ssr`            | `prerender` | Runtime server                            |
| --------- | ---------------- | ---------------- | ----------- | ----------------------------------------- |
| Product   | `apps/web`       | `false`          | —           | SPA shell on CDN                          |
| Marketing | `apps/marketing` | `true` (default) | `true`      | **None** (`adapter-static`, `csr: false`) |

Marketing builds full HTML at CI time. Product runs Convex + Clerk in the browser only.

## Generated artifacts (gitignored)

| Path                                                                                                                              | Restore                                    |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `convex/_generated/`                                                                                                              | `bun run codegen` (requires linked Convex) |
| `.agents/skills/convex*/`, `.agents/skills/clerk-*`, `.agents/skills/cloudflare/`, `.agents/skills/wrangler/`, `skills-lock.json` | `bun run setup`                            |

Committed symlinks: `.claude` → `.agents`, `CLAUDE.md` → `AGENTS.md`. Setup installs Convex skills via `convex ai-files`, Clerk skills (`clerk-react-patterns`, `clerk-testing`, `clerk-backend-api`), and Cloudflare skills (`cloudflare`, `wrangler`) via `bunx skills add` — all under `.agents/skills/`.

## Verify gate

Before ending a turn, run what applies to your edits:

| Change                           | Command                                                              |
| -------------------------------- | -------------------------------------------------------------------- |
| `apps/marketing/src/content/**`  | Prettier on touched paths + `bun run --filter @repo/marketing build` |
| Docs / Markdown only (elsewhere) | `bunx prettier --write <touched paths>`                              |
| `scripts/**` only                | Prettier on touched paths + `bun run lint`                           |
| Any `.ts` / `.js` / `.svelte`    | Prettier + `bun run check`                                           |
| Task complete or broad changes   | `bun run verify`                                                     |

Marketing content is prerendered at build time — SvelteKit crawls every `<a href>` and fails on 404s or missing fragment IDs. `bun run verify` does not run the marketing build; CI does.

Use `bunx prettier --write` (not `bun run format`, which is check-only).

## Error handling

- If a tool fails, analyze the error and retry with correction if possible
- Do not blame the user or environment; adapt and find alternatives
- If truly blocked, state what failed and one concrete next step — factually, without rhetorical questions
- **CLI stuck:** If a CLI command hangs, times out, or needs auth you do not have (e.g. `bunx clerk api …`), **ask the user to run it** and paste the output — do not probe undocumented API paths or install extra packages as a workaround

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
