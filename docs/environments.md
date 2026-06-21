# Environments and platform setup

How **development**, **staging**, and **production** map across Clerk, Convex, Cloudflare Pages, domains, and GitHub Actions. CI/CD workflow details live in [ci-cd.md](./ci-cd.md).

**Recommended path:** run `bun run setup` after [getting-started.md](./getting-started.md) — it walks identity, Convex, Clerk, GitHub secrets, and Cloudflare Pages with dashboard URLs and CLI commands. Manual steps below are fallbacks.

## Overview

| Tier            | Purpose                | Convex / Auth                     | Hostnames (example)                                                  |
| --------------- | ---------------------- | --------------------------------- | -------------------------------------------------------------------- |
| **Development** | Local, PR CI           | Dev deployment, Clerk             | `localhost:3000`, `localhost:3001`                                   |
| **Staging**     | Pre-prod on fixed URLs | Same as development               | `staging.{slug}-web.pages.dev`, `staging.{slug}-marketing.pages.dev` |
| **Production**  | Customer-facing        | Prod deployment, Clerk (prod app) | `{slug}-web.pages.dev` (+ `example.com` / `www` when apex is set)    |

Replace `example.com` with your apex domain from [`.svelter/setup.json`](../.svelter/setup.json). Staging and local share the **dev** Convex database — never production data.

## Deploy triggers

| Event                | What ships | Stack                                                               |
| -------------------- | ---------- | ------------------------------------------------------------------- |
| **Merge to `main`**  | Staging    | Convex dev + Cloudflare Pages (`--branch=staging`) + E2E (Actions)  |
| **Release workflow** | Production | `release-*` tag → Convex prod + Cloudflare Pages production deploys |

There is no `preview-*` release tag. Staging always reflects the latest merge to `main`.

## Domains and DNS

For apex domain `example.com`, hostnames look like this (`{slug}` from your product name, e.g. `svelter`):

| Surface       | Staging (`--branch=staging`)         | Production (`*.pages.dev`)   | Production (custom, optional) | Pages project              |
| ------------- | ------------------------------------ | ---------------------------- | ----------------------------- | -------------------------- |
| **Web app**   | `staging.{slug}-web.pages.dev`       | `{slug}-web.pages.dev`       | `example.com`                 | `{product-slug}-web`       |
| **Marketing** | `staging.{slug}-marketing.pages.dev` | `{slug}-marketing.pages.dev` | `www.example.com`             | `{product-slug}-marketing` |

**No apex yet:** Release can deploy to `{slug}-*.pages.dev` (marketing works immediately; web sign-in needs Clerk Production — see below). Add an apex later to attach custom production domains on Cloudflare.

### Clerk Production without a hosting apex

Skipping the apex prompt only defers **Cloudflare custom domains**. **Clerk Production is separate:** Clerk requires a domain you own to create a Production instance (`pk_live_…`). Clerk does not accept `*.pages.dev` for that step.

Until Clerk Production exists, setup can **defer** Clerk and still sync Convex + Cloudflare to the GitHub `production` environment. Release deploys will build, but **web sign-in on `{slug}-web.pages.dev` will not work** until you run `clerk deploy` (or the dashboard deploy flow) with your domain and re-run setup.

If you already own a domain but are not ready to host on it, you can still use that domain for Clerk Production DNS while serving the app on `*.pages.dev`.

### DNS (Cloudflare zone)

Keep domain registration at your registrar. Add the apex as a **Cloudflare zone** and point registrar nameservers to Cloudflare.

**Checklist:**

1. Run `bun run setup` with an apex domain — setup creates the zone (if needed), Pages projects, production custom domains, and GitHub secrets, then **pauses** until you confirm registrar nameservers point to Cloudflare.
2. At your registrar, set custom nameservers to the values setup prints (copy any email MX/TXT into Cloudflare DNS first).
3. Wait for propagation. Cloudflare shows hostnames **Active** when ready.

**No domain yet:** skip the apex prompt in setup (press Enter). Staging and production use `staging.*.pages.dev` and `{slug}-*.pages.dev`. Re-run setup with an apex to add `example.com` / `www` on Cloudflare and Clerk Production.

### Cloudflare Pages (web + marketing)

**Automated (`bun run setup`):** creates direct-upload Pages projects; with an apex, also creates the Cloudflare zone and production custom domains (`example.com`, `www.example.com`). Syncs `CLOUDFLARE_*` / `CF_PAGES_PROJECT_*` to repository secrets and the GitHub **`production`** environment (prod Convex + Clerk + Cloudflare). **Does not build or deploy** — CI only. **Manual only:** registrar nameserver pause when an apex is set.

**Deploy model (GitHub Actions only):**

| Hostname assignment                                                  | How it updates                                                          |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `{slug}-web.pages.dev`, `{slug}-marketing.pages.dev`                 | **Release** → `release-*` tag → production `wrangler pages deploy`      |
| `example.com`, `www.example.com` (when apex configured)              | Same Release deploy — also served on custom domains attached in setup   |
| `staging.{slug}-web.pages.dev`, `staging.{slug}-marketing.pages.dev` | **Merge to `main`** → Staging workflow → deploy with `--branch=staging` |

`PUBLIC_*` values are baked at **build time in CI** — no Pages dashboard env drift. Security headers live in `apps/*/build/_headers` (generated at build). Web SPA routing uses `index.html` fallback and Cloudflare Pages built-in SPA mode (no `_redirects`).

**Auth stack by URL (web app sign-in):**

| URL                            | Convex      | Clerk instance                             |
| ------------------------------ | ----------- | ------------------------------------------ |
| `staging.{slug}-web.pages.dev` | Development | Development (`pk_test_…` in staging build) |
| `{slug}-web.pages.dev`         | Production  | Production (`pk_live_…` in release build)  |
| `example.com` (when apex set)  | Production  | Production (same release build)            |

Marketing is static SSG — no Clerk on marketing hostnames.

### Clerk + Convex

| Deployment context | Convex env var              | Web env (`apps/web`)                               |
| ------------------ | --------------------------- | -------------------------------------------------- |
| **Development**    | `CLERK_JWT_ISSUER_DOMAIN`   | `PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| **Production**     | prod Clerk issuer on Convex | prod Clerk keys baked in Release build             |

Enable sign-in providers in the **Clerk dashboard** (Google, email, etc.). Activate the [Convex integration](https://dashboard.clerk.com/apps/setup/convex) so JWTs include the `convex` audience.

### Convex

| Deployment      | Used when                                                             |
| --------------- | --------------------------------------------------------------------- |
| **Development** | Local, PR CI, merge to `main` (`CONVEX_DEPLOY_KEY` repository secret) |
| **Production**  | `release-*` releases (`CONVEX_DEPLOY_KEY` in GitHub `production` env) |

### GitHub environments

| Scope                | Secrets    | Used for                                                |
| -------------------- | ---------- | ------------------------------------------------------- |
| **Repository**       | Dev stack  | PR CI, Staging (Convex + Pages staging + E2E on `main`) |
| **`production` env** | Prod stack | `release-*` Release deploys only                        |

Details: [ci-cd.md](./ci-cd.md#repository-secrets).

### Cross-app origins (marketing ↔ product)

Cross-app links resolve **at runtime** from the current URL (port ±1, `-web`/`-marketing` swap on `*.pages.dev`). Apex production release bakes marketing CTAs and canonical URLs via `APEX_DOMAIN` in the deploy-marketing action. See `packages/config/cross-app-origin.ts` and [configuration.md](../../apps/marketing/src/content/docs/configuration.md).

## First-time checklist

1. `bun run setup` through Convex, Clerk, Cloudflare Pages, GitHub + **production** environment secrets.
2. Staging URLs (`staging.*.pages.dev`) after first merge to `main`; production URLs (`{slug}-*.pages.dev`) after **Release**.
3. Optional: apex DNS (`example.com`, `www`) after re-run setup with a domain.
4. Merge a PR to `main` → **Staging** workflow green.
5. **Release** workflow → `release-*` tag.

---

## Next

- [ci-cd.md](./ci-cd.md)
- [getting-started.md](./getting-started.md)
- [development.md](./development.md#e2e-tests-playwright)
