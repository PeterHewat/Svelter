# CI/CD and deployments

## Workflows

| Workflow                                        | Purpose                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| [ci.yml](../.github/workflows/ci.yml)           | Lint, test, and build on pull requests to `main` (not re-run on merge)                |
| [staging.yml](../.github/workflows/staging.yml) | On push to `main`: Convex dev deploy + Cloudflare Pages staging + full Playwright E2E |
| [release.yml](../.github/workflows/release.yml) | Production release: verify CI + Staging, tag `release-*`, deploy full stack           |
| [deploy.yml](../.github/workflows/deploy.yml)   | **Deploy** — redeploy/rollback a `release-*` tag (also called from Release)           |
| [e2e.yml](../.github/workflows/e2e.yml)         | Manual Playwright (web and/or marketing); reusable from Staging                       |

**Staging:** merge to `main` → [staging.yml](../.github/workflows/staging.yml) (Convex dev + Cloudflare Pages staging + E2E).

**Production release:** Actions → **Release** (from `main`). Creates `release-2026-06-07-18-55-37`, deploys Convex prod + Cloudflare Pages production. Requires green **Staging** on the same commit.

**Rollback / redeploy:** Actions → **Deploy** → `release-*` tag.

**CI vs staging vs release:** [ci.yml](../.github/workflows/ci.yml) runs on **pull requests only**. [staging.yml](../.github/workflows/staging.yml) runs on **merge to `main`**. [Release](../.github/workflows/release.yml) verifies PR CI and Staging (Pages + E2E) before tagging.

**Production Pages build:** [deploy.yml](../.github/workflows/deploy.yml) runs `bun scripts/generate-convex.ts` and `bun run --filter @repo/web build` with GitHub **`production`** environment secrets (`PUBLIC_CONVEX_URL`, `PUBLIC_CLERK_PUBLISHABLE_KEY`).

**No Turborepo/Nx:** Path-based jobs and [setup-bun](../.github/actions/setup-bun/action.yml) (`bun install --ignore-scripts` in CI; lifecycle scripts run only where needed). See [ADR-003](./adr/003-bun-native-monorepo-tasks-and-ci.md).

## Deployment tiers

| Lane            | Convex / Auth | Web domain (example)                             | Marketing (example)                            | When                                                    |
| --------------- | ------------- | ------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------- |
| **Local + E2E** | Dev / Clerk   | `localhost:3000`                                 | `localhost:3001`                               | Dev, Playwright                                         |
| **Staging**     | Dev / Clerk   | `staging.{slug}-web.pages.dev`                   | `staging.{slug}-marketing.pages.dev`           | Merge to `main` (Staging CI + Pages `--branch=staging`) |
| **Production**  | Prod / Clerk  | `{slug}-web.pages.dev` (+ `example.com` if apex) | `{slug}-marketing.pages.dev` (+ `www` if apex) | Release → `release-*` tag                               |

Platform setup and DNS: **[environments.md](./environments.md)**.

## GitHub Environments

[deploy.yml](../.github/workflows/deploy.yml) uses the GitHub **`production`** environment for all jobs. [staging.yml](../.github/workflows/staging.yml) uses **repository secrets** (dev stack).

| Scope                | Secrets                            | Deploy behavior                                         |
| -------------------- | ---------------------------------- | ------------------------------------------------------- |
| **Repository**       | Dev stack (see below)              | PR CI, Staging on `main` (Convex + Pages staging + E2E) |
| **`production` env** | Prod stack (same secret **names**) | `release-*` — Convex prod; Cloudflare Pages production  |

Create **`production`** under **Settings → Environments** and add prod credentials there. Full checklist: [environments.md](./environments.md#github-environments).

## CI behavior

Job definitions live in [ci.yml](../.github/workflows/ci.yml). Use **CI required** as the merge gate; other jobs may show **Success (skipped)** when paths or secrets do not apply.

**Docs-only PRs:** only **CI checks** runs Prettier; lint/typecheck/build are skipped.

**`CONVEX_DEPLOY_KEY` (repository):** `convex/_generated/` is not committed. The **checks** job runs `bun run check` (codegen + lint + typecheck). Other jobs that build or test the web app or Convex backend run `bun scripts/generate-convex.ts` and **fail** if the repository deploy key is missing. Use a **dev or preview** deploy key at repository level; keep the **production** key in the GitHub **`production`** environment only ([getting-started.md](./getting-started.md#5-github-actions-secrets)).

**Web job:** When `apps/web/**` changes, one job builds `@repo/web` and runs `test:coverage` for `@repo/web`, `@repo/ui-svelte`, and `@repo/utils` (plus utils integration tests). `@repo/web` and `@repo/ui-svelte` enforce minimum coverage percentages.

**Package / marketing / Convex jobs:** `test:coverage` for `@repo/config`, `@repo/env-core`, `@repo/marketing`, and `@repo/convex` when those paths change.

## Branch protection

CI runs on **pull requests only**, not on merge to `main`. Configure `main` so every change goes through a PR with green checks — do not rely on post-merge CI.

In **Settings → Branches** → add a rule for `main`:

| Setting                               | Recommendation                                    |
| ------------------------------------- | ------------------------------------------------- |
| Require a pull request before merging | On — no direct pushes to `main`                   |
| Require approvals                     | Per team policy (optional)                        |
| Require status checks to pass         | On — see table below                              |
| Require branches to be up to date     | On (optional; reduces drift)                      |
| Do not allow bypassing                | On for admins unless you accept unverified merges |

Suggested **required status checks** (from [ci.yml](../.github/workflows/ci.yml)):

| Check       | Job                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------- |
| CI required | `required` (job id; display name **CI required** — aggregates path-based jobs)                  |
| CI checks   | `checks` (detect, audit, secrets, format/lint/typecheck) — optional duplicate of the gate above |

`checks` replaces the former `detect-changes`, `security-audit`, `secrets-scan`, and `quality` jobs. Remove obsolete required checks named `security-audit`, `secrets-scan`, or old job ids (`ci-required`, `ci-checks`) from branch protection if still listed.

Direct pushes to `main` (if allowed) will **not** run [ci.yml](../.github/workflows/ci.yml) and will block [Release](../.github/workflows/release.yml) until a PR-based check exists.

## E2E tests (Playwright)

Playwright does **not** run on pull requests. It runs on every **merge to `main`** via [staging.yml](../.github/workflows/staging.yml) (full suite when secrets are set).

- **Local:** `bun run e2e:install` then `bun run --filter @repo/web e2e` (and/or `@repo/marketing`). See [development.md](./development.md#e2e-tests-playwright).
- **Staging:** [staging.yml](../.github/workflows/staging.yml) after Convex dev deploy — `require_full_web_e2e: true`.
- **Manual:** Actions → **E2E** → **Run workflow** ([e2e.yml](../.github/workflows/e2e.yml)).
- **Release:** verifies a successful **Staging** run on the same commit (no E2E re-run).

The **E2E** workflow runs **UI-only** (`home`, `routing`) when Clerk E2E secrets are missing; Staging requires the full suite. **E2E targets dev:** `tasks.e2e.ts` uses `PUBLIC_CONVEX_URL` (Convex **dev** deployment) and `@clerk/testing` email sign-in — never production.

## Repository secrets

Configure in **Settings → Secrets and variables → Actions**. Used by PR CI, Staging (Convex + Pages + E2E on `main`) — **development** stack only.

`bun run setup` can set these via `gh secret set` when you confirm after readiness (see [getting-started.md](./getting-started.md)).

| Secret                         | Purpose                                | Setup / source                                                                       |
| ------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------ |
| `CONVEX_DEPLOY_KEY`            | CI/E2E codegen + Staging Convex deploy | Setup mints via `npx convex deployment token create github-ci`                       |
| `PUBLIC_CONVEX_URL`            | E2E + web staging/prod builds          | From `apps/web/.env.local` / `bun run dev:convex`                                    |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | Web staging/prod builds                | From `apps/web/.env.local` / setup                                                   |
| `E2E_USER_EMAIL`               | Playwright Clerk sign-in               | [development.md](./development.md#e2e-tests-playwright)                              |
| `CLERK_SECRET_KEY`             | `@clerk/testing` Playwright helpers    | From Clerk dashboard; also in `apps/web/.env.local` for local E2E                    |
| `CLOUDFLARE_API_TOKEN`         | Wrangler Pages deploy                  | Setup Cloudflare step — [API tokens](https://dash.cloudflare.com/profile/api-tokens) |
| `CLOUDFLARE_ACCOUNT_ID`        | Account scope for Wrangler             | Setup Cloudflare step or dashboard URL                                               |
| `CF_PAGES_PROJECT_WEB`         | `apps/web` project name                | Setup Cloudflare step (e.g. `{slug}-web`)                                            |
| `CF_PAGES_PROJECT_MARKETING`   | `apps/marketing` project name          | Setup Cloudflare step (e.g. `{slug}-marketing`)                                      |

### `production` environment secrets

Configure in **Settings → Environments → production → Environment secrets**. Used for `release-*` tags. Same secret **names**, **production** values. **`bun run setup`** can populate these when you confirm the **Production** step (after dev + Cloudflare); manual fallback:

| Secret                         | Purpose            | Where to find it                                                                         |
| ------------------------------ | ------------------ | ---------------------------------------------------------------------------------------- |
| `CONVEX_DEPLOY_KEY`            | Convex prod deploy | [Convex](https://dashboard.convex.dev) → Production → Settings → Deploy Key              |
| `PUBLIC_CONVEX_URL`            | Web prod build     | Convex Production deployment URL                                                         |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | Web prod build     | Clerk Production → API keys (`pk_live_…`)                                                |
| `CLOUDFLARE_API_TOKEN`         | Prod Pages deploy  | [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) |
| `CLOUDFLARE_ACCOUNT_ID`        | Account scope      | Same as repository or `.svelter/setup.json` → `cloudflare.accountId`                     |
| `CF_PAGES_PROJECT_WEB`         | Web project name   | Same as repository (e.g. `{slug}-web`)                                                   |
| `CF_PAGES_PROJECT_MARKETING`   | Marketing project  | Same as repository                                                                       |

Domains, DNS, and Pages hostname assignment: [environments.md](./environments.md#domains-and-dns).

### Cloudflare Pages (web + marketing)

Two direct-upload projects from this monorepo (`apps/web`, `apps/marketing`). Prefer **`bun run setup`** (Cloudflare step) or follow [environments.md](./environments.md#cloudflare-pages-web--marketing).

**Web build:** `PUBLIC_CONVEX_URL` and `PUBLIC_CLERK_PUBLISHABLE_KEY` are set in GitHub Actions during `bun run --filter @repo/web build` (repository secrets for staging; `production` environment for releases).

**Release deploys:** [release.yml](../.github/workflows/release.yml) — verify Staging, then Convex → web + marketing in parallel.

**Staging:** merge to `main` → [staging.yml](../.github/workflows/staging.yml) deploys both apps with `wrangler pages deploy … --branch=staging`.

Tune CSP in `packages/config/pages-edge.ts` (emitted to `apps/web/build/_headers`).

Deploy actions: [deploy-convex](../.github/actions/deploy-convex), [deploy-web](../.github/actions/deploy-web), [deploy-marketing](../.github/actions/deploy-marketing).

### Getting the Convex deploy key

**Production:** Convex Dashboard → **Production** → Settings → Deploy Key → GitHub **`production`** environment.

**CI / Staging / E2E:** dev deploy key as repository `CONVEX_DEPLOY_KEY`. Setup mints one interactively; do not duplicate the production key at repository level.

> Never commit secrets. Use GitHub repository or environment secrets ([environments.md](./environments.md)).

## Manual workflows

Heavy workflows run only from **Actions** → **Run workflow**. Choose the **branch** with GitHub’s **Use workflow from** dropdown when running E2E on a specific ref.

### Staging

**Workflow:** [staging.yml](../.github/workflows/staging.yml) — automatic on **push to `main`**

Convex dev deploy, Cloudflare Pages staging deploys, then full Playwright E2E.

### Release

**Workflow:** [release.yml](../.github/workflows/release.yml) → **Release** (from `main` only, no inputs)

Verifies PR CI + successful Staging on the commit, creates `release-2026-06-07-18-55-37`, deploys production stack. Deploy order: **Convex**, then **web** and **marketing** in parallel.

### Deploy

**Workflow:** [deploy.yml](../.github/workflows/deploy.yml) → **Deploy** — redeploy or rollback a production tag

| Input | Purpose                                         |
| ----- | ----------------------------------------------- |
| `tag` | e.g. `release-2026-06-07-18-55-37` (full stack) |

### E2E (Playwright)

**Workflow:** [e2e.yml](../.github/workflows/e2e.yml) → **E2E** (manual) or from **Staging** on every merge to `main`

| Input           | Purpose                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `run_web`       | `@repo/web` — UI-only without secrets; full suite (incl. `tasks.e2e.ts`) when repository secrets + `CONVEX_DEPLOY_KEY` are set |
| `run_marketing` | `@repo/marketing` Playwright                                                                                                   |

Full web E2E requires repository `CONVEX_DEPLOY_KEY` for codegen; UI-only does not. Does **not** run on PRs. Reports upload as workflow artifacts.

## PR labels and release notes

Release notes group **merged PRs** by label ([.github/release.yml](../.github/release.yml)). Squash-merge PRs so each PR becomes one commit on `main`. Use one primary label per PR (`enhancement`, `fix`, `breaking-change`, `security`, `documentation`, `dependencies`). Use `chore` for CI, workflows, and other internal changes; `test` or `ignore-for-release` when those fit better.

| Label                                                                                | Role                                          |
| ------------------------------------------------------------------------------------ | --------------------------------------------- |
| `enhancement`, `fix`, `breaking-change`, `security`, `documentation`, `dependencies` | Release note categories                       |
| `bug`                                                                                | Issues (also accepted on PRs alongside `fix`) |
| `test`, `chore`, `ignore-for-release`                                                | Excluded from release notes                   |
| `duplicate`, `invalid`, `wontfix`, `question`                                        | Issue triage                                  |

Dependabot applies `dependencies`, `github-actions`, `monorepo`, and `typescript`; bot PRs are excluded from notes by author.

`bun run setup` syncs labels to GitHub once per fork (`github.labelsSynced` in [`.svelter/setup.json`](../.svelter/setup.json)). Definitions live in [`packages/config/github-labels.ts`](../packages/config/github-labels.ts) — keep aligned with [.github/release.yml](../.github/release.yml). Use `chore` for CI and workflow changes.
