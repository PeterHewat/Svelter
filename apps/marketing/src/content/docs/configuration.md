---
title: "Configuration"
description: "Environment variables for the product app, Convex backend, and marketing site."
order: 2
---

Svelter uses three environment layers. Never read `process.env` directly in app code — use the provided loaders.

## Product app (`apps/web`)

Public variables are loaded via `loadWebEnv` in `apps/web/src/lib/web-env.ts`. Copy `.env.example` to `.env.local` and fill in Clerk and Convex URLs.

## Convex backend

Server secrets use `requireEnv` in `convex/lib/env.ts`. Set values in the Convex dashboard for each deployment.

## Marketing site

The marketing app is static HTML — no runtime secrets. Product URLs and branding are resolved at **build time**.

### Linking marketing ↔ product app

Marketing CTAs call `resolveProductAppOrigin()` from `@repo/config/app-origins` (via `product-links.ts`). Canonical / hreflang URLs use `PUBLIC_MARKETING_ORIGIN` (see `apps/marketing/svelte.config.js`). The product app links back via `marketingSiteHref()` in `apps/web/src/lib/marketing-link.ts`, which reads `PUBLIC_MARKETING_ORIGIN`.

| Tier                               | Product (web app)                      | Marketing site                               |
| ---------------------------------- | -------------------------------------- | -------------------------------------------- |
| **Dev**                            | `http://localhost:3000`                | `http://localhost:3001`                      |
| **Preview**                        | `http://localhost:4000`                | `http://localhost:4001`                      |
| **Staging**                        | `https://staging.{slug}-web.pages.dev` | `https://staging.{slug}-marketing.pages.dev` |
| **Production** (no apex)           | `https://{slug}-web.pages.dev`         | `https://{slug}-marketing.pages.dev`         |
| **Production** (apex `foobar.com`) | `https://foobar.com`                   | `https://www.foobar.com`                     |

**Local dev** — defaults in `@repo/config/dev-ports`; no env vars needed.

**Local preview** — bake preview ports when building marketing:

```bash
PUBLIC_PRODUCT_APP_URL=http://localhost:4000 \
PUBLIC_MARKETING_ORIGIN=http://localhost:4001 \
  bun run --filter @repo/marketing build
```

**CI (staging / production)** — the deploy-marketing GitHub Action sets both `PUBLIC_*` origins from your Pages project names (and `APEX_DOMAIN` on production release when configured via `bun run setup`). See `packages/config/app-origins.ts` and [environments.md](../../../../docs/environments.md).

Nav **Dashboard** uses `ProductAppLink` → product app root. The product app footer copyright link uses `marketingHomeHref()` (locale + theme query params).

## Shared branding

`PRODUCT_TAGLINE` in `packages/config/product.ts` is the single source for the marketing hero subtitle, homepage `<title>`, and GitHub repo About description (updated by `bun run setup`). Marketing copy for labels lives in i18n locale files and `marketing-content.ts`.
