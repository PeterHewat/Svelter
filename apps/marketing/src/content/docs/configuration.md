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

Cross-app links are resolved **at runtime** from the current URL (see `@repo/config/cross-app-origin`):

- **Explicit port** (local dev / preview) → sibling port ±1 (`3000↔3001`, `4000↔4001`, etc.).
- **`*.pages.dev`** → swap `-web` / `-marketing` in the hostname (staging and production).
- **Apex production** → marketing CTAs are **baked at release build** (`APEX_DOMAIN`); the web app resolves `www.{apex}` at runtime.

No `PUBLIC_*` origin env vars are required for dev, preview, staging, or pages.dev production.

| Tier                               | Product (web app)                      | Marketing site                               |
| ---------------------------------- | -------------------------------------- | -------------------------------------------- |
| **Dev**                            | `http://localhost:3000`                | `http://localhost:3001`                      |
| **Preview**                        | `http://localhost:4000`                | `http://localhost:4001`                      |
| **Staging**                        | `https://staging.{slug}-web.pages.dev` | `https://staging.{slug}-marketing.pages.dev` |
| **Production** (no apex)           | `https://{slug}-web.pages.dev`         | `https://{slug}-marketing.pages.dev`         |
| **Production** (apex `foobar.com`) | `https://foobar.com`                   | `https://www.foobar.com`                     |

**Apex release** — `APEX_DOMAIN` is set in the deploy-marketing GitHub Action (via `bun run setup`). This bakes product-app CTA hrefs and canonical / hreflang URLs for production SEO.

Nav **Dashboard** uses `ProductAppLink` → product app root (patched by `/init.js` except on apex builds). The product app footer uses `marketingHomeHref()` (locale + theme query params).

## Shared branding

`PRODUCT_TAGLINE` in `packages/config/product.ts` is the single source for the marketing hero subtitle, homepage `<title>`, and GitHub repo About description (updated by `bun run setup`). Marketing copy for labels lives in i18n locale files and `marketing-content.ts`.
