# F-04: Marketing product launch (post-clone)

**Status:** Planned  
**Surface:** Forked monorepo (`apps/marketing`, `packages/config`, `docs/product.md`)  
**Actor:** Product owner / adopter  
**Phase:** v1  
**Prerequisite:** [v0/marketing.md](../v0/marketing.md) (F-03) shipped or merged in fork

## Purpose

Replace template placeholders with **product-specific** marketing. The v0 template provides components, routes, and wiring — v1 is almost entirely **content and configuration**, not new framework code.

## Launch checklist (recommended order)

### 1. Product identity & config

- [ ] `PRODUCT_NAME`, `PRODUCT_TAGLINE`, `GITHUB_REPO_URL` in `packages/config/product.ts`
- [ ] Cross-app links work end-to-end on your deploy tier (runtime resolution; apex release bakes marketing CTAs via `APEX_DOMAIN` — see `cross-app-origin.ts`)
- [ ] Clerk, Convex, Cloudflare (or host) env for **your** deployment — see root README
- [ ] Favicon, OG default image, social handles in footer config / i18n

### 2. Positioning & homepage content

Edit `apps/marketing/src/lib/marketing-content.ts`:

- [ ] Hero: outcome headline and subhead for **your** buyer — not “monorepo template”
- [ ] `ProductFrame` screenshot: real product UI (or honest MVP screenshot)
- [ ] Feature rows: two benefits tied to your product (add a third row in content if needed)
- [ ] FAQ: answers specific to your free tier, data handling, and upgrade path
- [ ] Enable optional sections only when you have assets: logo bar, metrics, testimonial, integrations, how-it-works, CTA band (`marketingSections`)

### 3. Documentation

Edit `apps/marketing/src/content/docs/`:

- [ ] Replace sample guides with your product setup, configuration, and deployment docs
- [ ] Keep or expand sidebar order via frontmatter `order`
- [ ] Translate doc bodies per locale if needed (template ships EN-only bodies; chrome labels use i18n)

### 4. Pricing

- [ ] Tier names, prices, and **real** limits in content module / i18n
- [ ] Comparison table rows match what the product enforces (or will enforce at launch)
- [ ] Enterprise row: add contact email/link only if you offer it
- [ ] FAQ: refunds, cancellation, billing — aligned with your actual policy

### 5. Secondary pages

Stub routes exist but are **not** in nav by default. Add nav/footer links when you have content:

| Page               | Do when…                                           |
| ------------------ | -------------------------------------------------- |
| `/features`        | You can describe 3+ product areas clearly          |
| `/features/[slug]` | Each deep-dive has workflow narrative + screenshot |
| `/integrations`    | You ship or document real integrations             |
| `/customers`       | You have logos or testimonials to show             |
| `/security`        | You need trust center for B2B buyers               |
| `/about`           | Team/mission story helps conversion                |

- [ ] 2–3 feature deep-dives if `/features` is linked from nav

### 6. Blog & changelog

- [ ] Remove or rewrite template sample posts (`hello-world`, sample changelog)
- [ ] Publish launch changelog entry (`type: changelog`)
- [ ] Plan: articles for SEO, changelog entries per release

### 7. Legal & trust

- [ ] `/legal/privacy` and `/legal/terms` — real copy (lawyer or reputable generator + review)
- [ ] Security page: subprocessors and data handling match your stack (Clerk, Convex, host)

### 8. i18n (optional)

- [ ] If shipping non-English: translate marketing keys in every `MARKETING_LOCALES` file
- [ ] If EN-only for MVP: document that in README; trim unused locale routes if desired

### 9. SEO

- [ ] Per-page titles and descriptions reflect your product keywords
- [ ] Verify `sitemap.xml` and canonical URLs on production domain
- [ ] Submit sitemap to Search Console when live

### 10. Deploy & verify

- [ ] Marketing static build on CDN (e.g. Cloudflare Pages)
- [ ] Product SPA on app subdomain; CTA links work end-to-end
- [ ] Smoke test: marketing **Open app** → anonymous use → sign-up in product app when ready
- [ ] Playwright in fork updated if copy/URLs diverge from template defaults

## Copy discipline

Apply to **your** copy:

- Primary CTA: “Open app” → product (freemium; Clerk auth and billing in-app)
- Free tier limits stated plainly on pricing and FAQ
- Product UI in hero — no stock-photo substitutes for the product
- Every section earns its place; leave optional sections disabled until you have real content

## Reference sites (for positioning, not layout)

| Site                           | Borrow for product marketing                   |
| ------------------------------ | ---------------------------------------------- |
| [Inkeep](https://inkeep.com)   | Restraint, in-product docs, calm layout        |
| [Linear](https://linear.app)   | Ship changelog posts; product UI as pitch      |
| [Notion](https://notion.so)    | Free tier centrality; persona-led benefits     |
| [Mercury](https://mercury.com) | Trust through restraint; security for startups |
| [Ramp](https://ramp.com)       | Quantified outcomes when you have them         |
| [Resend](https://resend.com)   | Brevity — minimal nav and copy                 |

Full reference tables: [v0/marketing.md](../v0/marketing.md#reference-sites).

## Out of scope (v1)

- Rebuilding marketing components (belongs in upstream v0)
- External headless CMS
- In-app subscription billing
- Sales-led primary motion
- Multi-product marketing from one repo

## Fork hygiene

- Keep template `docs/spec/v0/` as upstream reference; track **your** roadmap in `docs/product.md`
- Add fork-specific rows to `feature-matrix.md` as `v2+` when you outgrow v1
- Pull v0 template improvements from upstream periodically

Update [feature-matrix.md](../feature-matrix.md) **F-04** when launch checklist is complete.
