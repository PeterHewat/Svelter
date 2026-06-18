# Phase v1 — Product launch from template (post-clone)

## Goal

Turn a Svelter fork into **your** B2B SaaS: real positioning, assets, pricing, content, and legal — using the v0 **PLG** (product-led growth) marketing shell without rebuilding it.

**Audience:** You (or any adopter) after a fresh start from the template — typically a solo dev spinning up a new product idea.

**Prerequisite:** [v0](../v0/README.md) complete in the fork (or merged from upstream), especially [marketing-plg.md](../v0/marketing-plg.md).

## Definition of done

- [ ] `packages/config/product.ts` and env layers point at your product app, docs, and domains
- [ ] `docs/product.md` filled in (vision, users, MVP features)
- [ ] Marketing placeholders replaced: hero copy, screenshots, metrics, logos, testimonial
- [ ] Pricing reflects **real** tier limits, prices, and comparison rows
- [ ] Secondary pages you need are fleshed out; unused routes removed or hidden from nav
- [ ] Blog: delete template samples; publish your articles and changelog as you ship
- [ ] Legal pages reviewed (privacy, terms) — not template lorem
- [ ] Locales: translate new marketing keys if you ship non-English markets
- [ ] Analytics chosen and installed (e.g. Plausible, Fathom) if desired
- [ ] Deploy marketing + product apps to production URLs

## Epics (typical order)

1. [marketing-product.md](./marketing-product.md) — config, content, assets, pages, launch checklist

## Open decisions (per product)

| Decision                | When to decide                                         |
| ----------------------- | ------------------------------------------------------ |
| Which nav pages to keep | After positioning — drop unused stubs                  |
| i18n breadth            | Ship EN first; add locales when needed                 |
| Enterprise / sales      | Only if PLG (product-led growth) alone is insufficient |
| Status page             | When you have uptime to show                           |
| CMS                     | Post-launch if markdown in-repo is tight               |

## Not v1 (later product phases)

- In-app billing integration (Stripe, etc.) — product app concern
- Full case-study CMS
- A/B testing, interactive demos, video hero
- ROI calculator, dedicated enterprise solutions site

Track those in your fork’s `docs/product.md` and feature matrix as `v2+` when scheduled.
