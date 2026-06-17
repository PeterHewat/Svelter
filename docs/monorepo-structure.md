# Monorepo structure

**Surfaces:** `apps/web` (SvelteKit SPA), `apps/marketing` (SvelteKit SSG), `convex/` (Convex + Clerk JWT). CI/deploy: [ci-cd.md](./ci-cd.md).

## Layout

```text
apps/web/           # Product UI — @repo/ui-svelte, utils, tokens, config, env-core
apps/marketing/     # SvelteKit SSG — @repo/tokens, config
packages/utils/     # Shared client utilities (@repo/utils)
packages/tokens/    # Shared CSS variables (@repo/tokens)
packages/ui-svelte/ # Shared Svelte components (@repo/ui-svelte)
packages/test-utils/# Test fixtures (dev/test only)
packages/config/    # Aliases, product name, env placeholders (@repo/config)
packages/env-core/  # Framework-agnostic env loaders (@repo/env-core)
convex/             # Backend — no @repo imports; Convex CLI root
scripts/            # Setup, generate (`bun scripts/…` — not imported by apps)
docs/               # Human + agent documentation
```

## Dependency graph

```text
@repo/test-utils  (dev/test)
        ↑
@repo/utils
        ↑
@repo/ui-svelte
        ↑
@repo/web

@repo/tokens ──┬── @repo/marketing
@repo/config ──┤
@repo/env-core ┘

@repo/convex      (standalone — no @repo imports)
```

## Environment variables (three layers)

| Layer          | Code                           | Runtime                     | Use                                                                  |
| -------------- | ------------------------------ | --------------------------- | -------------------------------------------------------------------- |
| Generic loader | `packages/env-core/src/env.ts` | Any (with a source adapter) | `loadEnv`, `asString`, `asInt`, `asBoolean` via `@repo/env-core/env` |
| Web app        | `apps/web/src/lib/web-env.ts`  | Vite / browser              | `PUBLIC_CONVEX_URL` via `loadWebEnv()`                               |
| Convex server  | `convex/lib/env.ts`            | Convex dashboard vars       | `requireEnv` — reads `process.env` in Convex only                    |

`@repo/utils/env` re-exports the same parsers for apps already on `@repo/utils`. Do **not** import `@repo/utils` from Convex: the package includes browser-oriented stores (Zustand). Convex uses `convex/lib/env.ts` only (see [ADR-002](./adr/002-package-boundary-authoring.md)).

### Env files

Setup: [getting-started.md](./getting-started.md).

| Source                  | File                  | Scope                                  |
| ----------------------- | --------------------- | -------------------------------------- |
| `apps/web/.env.example` | `apps/web/.env.local` | `PUBLIC_CONVEX_URL`, optional E2E vars |
| Convex dashboard        | _(dashboard only)_    | `CLERK_JWT_ISSUER_DOMAIN`              |

## Path aliases

TypeScript paths live in [tsconfig.paths.json](../tsconfig.paths.json) (extended by `tsconfig.base.json`). Vite and Vitest consume the same targets via [packages/config/aliases.ts](../packages/config/aliases.ts). When adding a workspace package, update both files.

Subpath imports for `@repo/utils` (prefer narrow imports in new code):

- `@repo/utils` — `cn()` and barrel re-exports
- `@repo/env-core/env` — `loadEnv` / parsers (also re-exported as `@repo/utils/env`)
- `@repo/utils/env`, `./theme`, `./i18n`, `./storage`

## Task orchestration

This template does **not** use Turborepo, Nx, or similar orchestrators. Tasks run via Bun workspaces, root [package.json](../package.json) scripts, and `bun run --filter` ([development.md#commands](./development.md#commands)). CI uses path-based job selection and cached installs via `.github/actions/setup-bun`. Rationale: [ADR-003](./adr/003-bun-native-monorepo-tasks-and-ci.md).

`@repo/config` is a workspace package (`noEmit`); Vite still transpiles `aliases.ts` at config load time.

## Typecheck vs build

| Script      | Command                                                  | Purpose                                                                                           |
| ----------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `codegen`   | `bun scripts/generate.ts` + `assert-convex-generated.ts` | Restore gitignored generated files before typecheck/test                                          |
| `check`     | `codegen` → `lint` → `typecheck`                         | Default quality gate (CI checks job, agents after workspace edits)                                |
| `verify`    | `check` → `test`                                         | Full local/PR-equivalent gate                                                                     |
| `typecheck` | `tsc -p tsconfig.json --noEmit`                          | Solution-wide check, no emit (`skipLibCheck: true` in base — see comment in `tsconfig.base.json`) |
| `build`     | `tsc -b`                                                 | Emit `.d.ts` for composite packages (`emitDeclarationOnly`) — **not** SvelteKit app bundles       |
| `build:all` | `build` + `bun run --filter '*' build`                   | Solution `tsc -b`, then each workspace `build` (skips packages without a script)                  |

Convex has no local bundle artifact — `@repo/convex` `build` is `tsc --noEmit`; production upload is `convex deploy` / CI, not root `build`.

App production builds: `bun run --filter @repo/web build`, `bun run --filter @repo/marketing build`.

## Root `test` script

`bun run test` runs `bun run --filter '*' test`, so any workspace that defines a `test` script is included automatically (e.g. `@repo/test-utils` has no `test` script and is skipped).

## Release tags

Staging: merge to `main`. Production tags: `release-2026-06-07-18-55-37` (one tag per release — full stack). See [ci-cd.md](./ci-cd.md).

## Generated code (not committed)

| Output                                                                                                                            | Generator                     | Command                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `convex/_generated/`                                                                                                              | Convex                        | `bun run dev:convex` or `bun scripts/generate-convex.ts`                                                                          |
| `.agents/skills/convex*/`, `.agents/skills/clerk-*`, `.agents/skills/cloudflare/`, `.agents/skills/wrangler/`, `skills-lock.json` | `bun run setup` (best effort) | `bunx convex ai-files install`; Clerk/Cloudflare: see `clerkSkillsInstallCommand()` / `cloudflareSkillsInstallCommand()` in setup |

Repo-owned agent skills (e.g. `.agents/skills/pr-push/`) live under `.agents/skills/`. `.claude` is a symlink to `.agents` (committed) so Claude Code and Convex `ai-files` share the same tree; Convex `convex*` and Clerk `clerk-*` install targets are gitignored. `CLAUDE.md` is a symlink to `AGENTS.md`.

Run **`bun run dev:convex`** or **`bun run codegen`** before the first `typecheck` / `test`. Use **`bun run check`** (or **`bun run verify`**) so codegen runs exactly once. There are **no committed** Convex stubs — missing `_generated` fails with remediation text.

- `bun scripts/generate.ts` — routes always; Convex only when linked (root `.env.local` or `CONVEX_DEPLOY_KEY`)
- Gitignored in `.gitignore`
- ESLint ignores `convex/_generated/`; Prettier ignores both paths (see `.prettierignore`)
- **CI:** jobs that need Convex require repository `CONVEX_DEPLOY_KEY` and run `bun scripts/generate-convex.ts` (see [ci-cd.md](./ci-cd.md#ci-behavior)). Production deploy key lives in GitHub **`production`** environment only ([environments.md](./environments.md)).

## Starter growth thresholds

Current flat/small layout is intentional. Add structure when the product earns it:

| Trigger                                                                     | Action                          |
| --------------------------------------------------------------------------- | ------------------------------- |
| Multiple app-local components reused across routes                          | `apps/web/src/lib/components/`  |
| A domain owns UI, helpers, tests, and copy together                         | `apps/web/src/routes/<domain>/` |
| Convex handlers share rules, exceed ~200 lines, or need plain-TS unit tests | `convex/model/<domain>.ts`      |

### Target shape for `apps/web/src/`

```text
lib/          # i18n, env, shared components
routes/       # SvelteKit file routes (+page.svelte, +layout.svelte)
```

The starter ships a sample tasks route at `apps/web/src/routes/tasks/` paired with `convex/tasks.ts`.

## Package authoring

See [ADR-002: Package boundary authoring](./adr/002-package-boundary-authoring.md) and package READMEs under `packages/utils/` and `packages/ui-svelte/`. Task/CI policy: [ADR-003](./adr/003-bun-native-monorepo-tasks-and-ci.md).

## Dependency overrides

Root `package.json` `overrides` pin transitive versions for security. Rationale and version table: [dependency-overrides.md](./dependency-overrides.md). Update that doc whenever overrides change.

## Further reading
