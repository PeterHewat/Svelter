# F-04: Marketing product launch (post-clone)

**Status:** Planned  
**Surface:** Forked monorepo (`apps/marketing`, `packages/config`, `docs/product.md`)  
**Actor:** Product owner / adopter  
**Phase:** v1  
**Prerequisite:** [v0/marketing-plg.md](../v0/marketing-plg.md) (F-03, product-led growth marketing) shipped or merged in fork

## Purpose

Replace template placeholders with **product-specific** marketing. The v0 template already provides components, routes, and wiring — v1 is almost entirely **content and configuration**, not new framework code.

## Launch checklist (recommended order)

### 1. Product identity & config

- [ ] `PRODUCT_NAME`, `PRODUCT_TAGLINE`, `GITHUB_REPO_URL` in `packages/config/product.ts`
- [ ] `PRODUCT_APP_URL`, `PRODUCT_SIGNUP_PATH`, `DOCS_URL` → production (or staging) URLs
- [ ] Clerk, Convex, Cloudflare (or host) env for **your** deployment — see root README
- [ ] Favicon, OG default image, social handles in footer config / i18n

### 2. Positioning & homepage content

Edit `apps/marketing/src/lib/marketing-content.ts` (or equivalent v0 content module):

- [ ] Hero: outcome headline and subhead for **your** buyer — not “monorepo template”
- [ ] `ProductFrame` screenshot: real product UI (or honest MVP screenshot)
- [ ] Logo bar: real customers only; **remove section** if pre-launch
- [ ] Feature rows: 3 benefits tied to your product modules
- [ ] Metrics strip: real or defensible numbers; remove if none yet
- [ ] Testimonial: real quote + attribution; remove until you have one
- [ ] Integrations teaser: only integrations you actually support
- [ ] FAQ: answers specific to your free tier, data handling, and upgrade path
- [ ] Disable sections you do not need (data flag per section in content module)

### 3. Pricing

- [ ] Tier names, prices, and **real** limits in content module / i18n
- [ ] Comparison table rows match what the product enforces (or will enforce at launch)
- [ ] Enterprise row: add contact email/link only if you offer it
- [ ] FAQ: refunds, cancellation, billing — aligned with your actual policy

### 4. Secondary pages

Enable only what supports your GTM:

| Page               | Do when…                                           |
| ------------------ | -------------------------------------------------- |
| `/features`        | You can describe 3+ product areas clearly          |
| `/features/[slug]` | Each deep-dive has workflow narrative + screenshot |
| `/integrations`    | You ship or document real integrations             |
| `/customers`       | You have logos or testimonials to show             |
| `/security`        | You need trust center for B2B buyers               |
| `/about`           | Team/mission story helps conversion                |

- [ ] Remove stub pages from nav/footer if unused (avoid 404s)
- [ ] 2–3 feature deep-dives if `/features` is in nav

### 5. Blog & changelog

- [ ] Remove or rewrite template sample posts (`hello-world`, sample changelog)
- [ ] Publish launch changelog entry (`type: changelog`)
- [ ] Plan: articles for SEO, changelog entries per release

### 6. Legal & trust

- [ ] `/legal/privacy` and `/legal/terms` — real copy (lawyer or reputable generator + review)
- [ ] Security page: subprocessors and data handling match your stack (Clerk, Convex, host)
- [ ] Cookie/analytics disclosure if analytics added

### 7. i18n (optional)

- [ ] If shipping non-English: translate new marketing keys in every `MARKETING_LOCALES` file
- [ ] If EN-only for MVP: document that in README; trim unused locale routes if desired

### 8. SEO & analytics

- [ ] Per-page titles and descriptions reflect your product keywords
- [ ] Verify `sitemap.xml` and canonical URLs on production domain
- [ ] Add analytics (Plausible, Fathom, etc.) — adopter choice, not in template
- [ ] Submit sitemap to Search Console when live

### 9. Deploy & verify

- [ ] Marketing static build on CDN (e.g. Cloudflare Pages)
- [ ] Product SPA on app subdomain; CTA links work end-to-end
- [ ] Smoke test: signup flow from marketing `Start free`
- [ ] Playwright in fork updated if copy/URLs diverge from template defaults

## Copy discipline (PLG — product-led growth)

Inherited from v0 template — still apply to **your** copy:

- Primary CTA: “Start free” → signup (not “Book a demo” unless you add enterprise motion later)
- Free tier limits stated plainly on pricing and FAQ
- Product UI in hero — no stock-photo substitutes for the product
- Every section earns its place; delete template filler rather than leaving it

## Reference sites (for positioning, not layout)

Use when writing **your** copy and choosing which pages to enable:

| Site                           | Borrow for product marketing                   |
| ------------------------------ | ---------------------------------------------- |
| [Linear](https://linear.app)   | Ship changelog posts; product UI as pitch      |
| [Notion](https://notion.so)    | Free tier centrality; persona-led benefits     |
| [Mercury](https://mercury.com) | Trust through restraint; security for startups |
| [Ramp](https://ramp.com)       | Quantified outcomes when you have them         |
| [Resend](https://resend.com)   | Brevity — cut nav and copy ruthlessly          |

Full reference tables live in [v0/marketing-plg.md](../v0/marketing-plg.md#reference-sites).

## Out of scope (v1)

- Rebuilding marketing components (belongs in upstream v0)
- CMS migration
- In-app subscription billing
- Sales-led primary motion
- Multi-product marketing from one repo

## Fork hygiene

- Keep template `docs/spec/v0/` as upstream reference; track **your** roadmap in `docs/product.md`
- Add fork-specific rows to `feature-matrix.md` as `v2+` when you outgrow v1
- Pull v0 template improvements from upstream periodically

Update [feature-matrix.md](../feature-matrix.md) **F-04** when launch checklist is complete.
