---
title: "Deployment"
description: "Build and deploy the static marketing site and product SPA to a CDN."
order: 3
---

Both apps deploy as static assets — no Node server at runtime.

## Marketing (`apps/marketing`)

```bash
bun run --filter @repo/marketing build
```

Output is static HTML suitable for Cloudflare Pages or any static host. Locale routes live under `/[lang]/`.

## Product (`apps/web`)

```bash
bun run --filter @repo/web build
```

The product app is a client-only SPA (`ssr: false`). Deploy the build output to a CDN subdomain (e.g. `app.example.com`).

## CI

The included GitHub Actions workflow deploys both apps. Cross-app links resolve at runtime; apex release bakes marketing CTAs via `APEX_DOMAIN`. See [Configuration](./configuration).
