# F-03: Marketing site (template)

Marketing site for **product-led growth**: self-serve signup, public pricing, and the product UI as the main conversion path (not “book a demo” as the primary CTA).

**Status:** Shipped  
**Surface:** `apps/marketing` (upstream Svelter template)  
**Actor:** Template maintainer  
**Phase:** v0  
**Adopter follow-up:** [v1/marketing-product.md](../v1/marketing-product.md)

## Scope

**In v0 (template):** Components, routes, config wiring, placeholder content, EN i18n keys, SEO plumbing, tests.

**Not in v0 ([v1](../v1/README.md)):** Real positioning, customer assets, production legal, translated doc bodies.

## Principles (template defaults)

- **Product entry:** Nav **Dashboard** → product app root (freemium; auth and billing in-app via Clerk). No duplicate CTAs in hero or pricing for v0.
- **Pricing is public** — free tier visually prominent with **example** limits.
- **Product UI in hero** — placeholder screenshot in `ProductFrame`; adopter swaps image in v1.
- **FAQ** includes free-plan objection handling (template copy).
- **Restraint over motion** — minimal animation; respect `prefers-reduced-motion`.
- **System font stack** — no webfont downloads; typography via size, weight, and spacing.
- **In-site docs** — `/[lang]/docs` on the marketing site (not a separate docs origin).

## Visual direction

Lean [Inkeep](https://inkeep.com)-style: neutral canvas, product UI focal point, soft card depth, generous whitespace. Shared semantic tokens in `@repo/tokens`; light/dark via `/init.js` and `prefers-color-scheme`.

Homepage defaults (`marketingSections`): hero, two feature rows, full pricing (tiers + comparison), and FAQ. Optional sections (logo bar, how-it-works, metrics, testimonial, integrations, CTA band) ship in the codebase but are **disabled by default** until adopters have assets.

## Reference sites

Curated for B2B SaaS. v0 implements **patterns**; v1 fills **copy and assets**.

### Primary references

| Site                                    | What they do well                                                                                                                            | Borrow for template                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [Inkeep](https://inkeep.com)            | Neutral layout, product screenshots in cards, docs in same chrome, calm SaaS polish.                                                         | Centered hero, in-site docs sidebar, optional homepage sections           |
| [Linear](https://linear.app)            | The product UI _is_ the pitch. Restrained aesthetic. Sharp one-line positioning. Public changelog as marketing.                              | `ProductFrame` hero, changelog posts in blog, minimal motion, single CTA  |
| [Resend](https://resend.com)            | Radical simplicity for a technical product. One clear value prop, minimal nav, immediate “Get started”.                                      | Hero brevity, tight section rhythm, Docs in nav                           |
| [Better Stack](https://betterstack.com) | Operational credibility: uptime, monitoring, logging as trust signals. Changelog + blog + docs on one surface. Clear tier limits on pricing. | Changelog in blog, in-site docs, metrics strip slot, FAQ on limits        |
| [Notion](https://notion.so)             | Free-forever tier is central to growth. Benefit-led copy. Calm whitespace.                                                                   | Free tier prominence on pricing                                           |
| [Vercel](https://vercel.com)            | Performance as brand. Developer-grade polish without being cold.                                                                             | Core Web Vitals discipline, logo bar slot, screenshot in hero             |
| [Supabase](https://supabase.com)        | Open-source positioning with enterprise credibility. Feature areas map to product. Transparent limits.                                       | Integrations grid component, feature rows, explicit free-tier limit slots |
| [Clerk](https://clerk.com)              | Shows actual UI in marketing. Clean docs in nav. Clear upgrade path.                                                                         | Docs in nav, pricing comparison table                                     |
| [Raycast](https://raycast.com)          | Personality without sacrificing B2B polish. Friction-free CTA.                                                                               | Testimonial block, integrations teaser, polished dark mode                |

### Trust, pricing & credibility

| Site                           | What they do well                                                                                                                  | Borrow for template                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [Stripe](https://stripe.com)   | Information architecture at scale. Precision typography. Trust through restraint. Pricing and docs one click away.                 | `/features/[slug]` route pattern, FAQ schema, legal stub routes |
| [Mercury](https://mercury.com) | Financial-grade trust through whitespace and typography — no stock photos, no clutter.                                             | `security` stub page, whitespace in `Section`                   |
| [Ramp](https://ramp.com)       | Quantified outcomes in headlines. Logo bar with recognizable brands. Comparison tables that respect the reader’s time.             | Metrics strip, logo bar, comparison table on pricing            |
| [Asana](https://asana.com)     | Use-case segmentation by team. Feature deep-dives with workflow context. Enterprise path exists but doesn’t overshadow self-serve. | Optional homepage sections, example `/features/[slug]`          |

### Anti-patterns

| Pattern                                  | Why we skip it                                        |
| ---------------------------------------- | ----------------------------------------------------- |
| “Book a demo” as primary CTA             | Sales-led; conflicts with self-serve signup           |
| Hidden pricing                           | Conflicts with transparent free tier                  |
| Separate docs subdomain                  | Docs live at `/[lang]/docs`                           |
| Blog filter tabs                         | Single chronological list                             |
| Video autoplay hero                      | Performance; out of scope                             |
| Interactive product builder in marketing | Heavy JS; conflicts with `csr: false`                 |
| Fake customer logos presented as real    | Placeholders labeled; v1 uses real or removes section |

## Shared config

`packages/config/product.ts` (adopters change in v1):

| Export                      | Purpose                                                                      | Example (template)      |
| --------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| `resolveProductAppOrigin()` | Product SPA origin for marketing CTAs (`PUBLIC_PRODUCT_APP_URL`)             | `http://localhost:3000` |
| `resolveMarketingOrigin()`  | Marketing origin for product footer home link (`PUBLIC_MARKETING_ORIGIN`)    | `http://localhost:3001` |
| `PRODUCT_SIGNUP_PATH`       | Clerk sign-up route in the **product app only** (not used by marketing CTAs) | `/sign-up`              |

Documentation: `src/content/docs/` → `/[lang]/docs`. GitHub: `GITHUB_REPO_URL` in marketing site config.

Marketing CTAs use `productAppHref()` → product app root (`resolveProductAppOrigin()`). Sign-up and billing happen in the product app. Cross-origin locale/theme sync uses `lang` and `theme` query params (see `@repo/utils/cross-app-prefs`).

## Placeholder content module

Centralize template copy and section toggles in `apps/marketing/src/lib/marketing-content.ts`:

- Section order and `enabled` flags (enable logo bar, testimonial, etc. without deleting components)
- Placeholder tier limits, metrics, FAQ items, feature row titles (default: **two** feature rows)
- Document each field with a short comment: “replace in v1”

Components read from this module + i18n for labels (`mt()`). **No product-specific story hardcoded in components.**

## Site map (template)

| Route                     | Template deliverable                           | Prerender |
| ------------------------- | ---------------------------------------------- | --------- |
| `/[lang]/`                | Homepage — default sections + optional blocks  | Yes       |
| `/[lang]/pricing`         | Redirect → `/[lang]#pricing`                   | Yes       |
| `/[lang]/docs`            | Documentation index + sidebar shell            | Yes       |
| `/[lang]/docs/[slug]`     | Documentation page (EN Markdown in template)   | Yes       |
| `/[lang]/blog`            | Chronological post list (articles + changelog) | Yes       |
| `/[lang]/blog/[slug]`     | Post detail (Markdown → HTML)                  | Yes       |
| `/[lang]/features`        | Stub or minimal overview                       | Yes       |
| `/[lang]/features/[slug]` | **One** example deep-dive                      | Yes       |
| `/[lang]/integrations`    | Stub or empty grid                             | Yes       |
| `/[lang]/customers`       | Stub                                           | Yes       |
| `/[lang]/security`        | Stub (example subprocessors table)             | Yes       |
| `/[lang]/about`           | Stub                                           | Yes       |
| `/[lang]/legal/privacy`   | Placeholder — “replace before launch” banner   | Yes       |
| `/[lang]/legal/terms`     | Placeholder — “replace before launch” banner   | Yes       |

**Nav:** Docs, Blog, FAQ (`#faq`), Pricing (`#pricing`), Dashboard. **Footer:** product (docs, blog, FAQ, pricing), resources (GitHub, security), legal. Stub routes (`/features`, `/about`, etc.) are prerendered but omitted from nav until adopters add content and links.

## Navigation

```text
[Logo → home]  Docs  Blog  FAQ  Pricing     [Lang] [Theme] [Dashboard →]
```

- **Pricing** → `/{lang}#pricing` (homepage section; works from any route)
- **FAQ** → `/{lang}#faq`
- **Dashboard** → `resolveProductAppOrigin()` (product app root)
- Mobile: nav links in a menu; **Dashboard** stays rightmost (visible without opening the menu); works without JS (static fallback)

## Homepage sections

Composable blocks in `marketingSections` — **enabled by default:**

1. **Hero** — centered headline, single CTA, `ProductFrame` below fold
2. **Feature rows** (×2) — alternating copy + product card
3. **FAQ** (`#faq`) — product + billing objections in one list + `FAQPage` JSON-LD
4. **Pricing** (`#pricing`) — tier cards, monthly/annual toggle, comparison table, Enterprise stub row

**Disabled by default:** logo bar, how-it-works, metrics, testimonial, integrations, CTA band.

## Pricing (homepage section)

| Tier         | Template default                               |
| ------------ | ---------------------------------------------- |
| **Free**     | $0 forever — visually dominant; example limits |
| **Pro**      | Placeholder price — “Most popular” badge       |
| **Business** | Placeholder price                              |

UI on homepage `#pricing`: monthly/annual toggle (CSS-only, no JS), tier CTAs → product app, comparison table, optional Enterprise stub row. `/[lang]/pricing` redirects to the anchor.

## Components

`apps/marketing/src/lib/components/` unless shared via `@repo/ui-svelte`:

| Component          | Responsibility                                                   |
| ------------------ | ---------------------------------------------------------------- |
| `ProductAppLink`   | Product app URLs with cross-origin locale/theme sync             |
| `MarketingNav`     | Sticky nav, mobile drawer, CTAs                                  |
| `MarketingFooter`  | Product, resources, legal columns                                |
| `Hero`             | Centered headline, product visual (no CTA button)                |
| `ProductFrame`     | Browser chrome wrapper for screenshots                           |
| `DocsShell`        | Sidebar + main column for documentation routes                   |
| `DocsSidebar`      | Doc navigation list                                              |
| `MarkdownContent`  | Renders build-time Markdown HTML (blog + docs)                   |
| `Section`          | Vertical rhythm + `container`                                    |
| `FeatureRow`       | Alternating image + copy                                         |
| `FeatureRows`      | Homepage feature block wrapper                                   |
| `PricingTable`     | Homepage pricing tiers, monthly/annual toggle, comparison matrix |
| `Faq`              | Static Q&A list + JSON-LD (`#faq` on homepage)                   |
| `BlogIndex`        | Chronological post list                                          |
| `LogoBar`          | Customer logo grid (optional)                                    |
| `HowItWorks`       | 3-step story (optional)                                          |
| `MetricsStrip`     | 3-column stats (optional)                                        |
| `Testimonial`      | Quote block (optional)                                           |
| `IntegrationsGrid` | Logo grid (optional)                                             |
| `CtaBand`          | Closing conversion block (optional)                              |

**Markdown:** `src/lib/markdown.ts` (`marked`) at build/prerender time. **Prose:** `.prose-marketing` in `app.css`. **Typography:** system font stack in `@theme`.

User-visible **labels** via `mt()`; section **body copy** from content module or i18n. Doc **bodies** are English Markdown in v0 (`src/content/docs/`).

## Blog (articles + changelog)

One pipeline: `src/content/blog/`. No separate changelog route.

| Field                             | Required | Values                           |
| --------------------------------- | -------- | -------------------------------- |
| `type`                            | No       | `article` (default), `changelog` |
| `version`                         | No       | string (changelog)               |
| `title`, `description`, `pubDate` | Yes      | —                                |
| `author`                          | No       | string (articles)                |

- Single chronological list on `/[lang]/blog`
- `type: changelog` shows a badge on list and detail views
- Samples: `hello-world.md` (`article`); one `changelog` sample

## Documentation

- Content: `src/content/docs/*.md` with `title`, `description`, optional `order`
- Routes: `/[lang]/docs`, `/[lang]/docs/[slug]`
- Sidebar via `DocsShell` / `DocsSidebar`
- Template ships **EN-only** doc bodies; i18n covers chrome labels (nav, sidebar, index intro)

## SEO & meta

- [x] Unique `<title>` and `meta description` per route via i18n
- [x] OG + Twitter tags on homepage
- [x] `FAQPage` JSON-LD on homepage FAQ (single merged list)
- [x] `hreflang` alternates per locale
- [x] `sitemap.xml` at build (all locales + routes above)
- [x] Canonical URLs per locale path

## Technical constraints

- `adapter-static`, `csr: false`
- No Convex or Clerk on marketing routes
- `@repo/tokens`, theme via `/init.js`
- Locale routes under `/[lang]/`
- Stub routes use `entries()` in `+page.ts` for prerender when not linked from nav

## Acceptance criteria

### Epic 1 — Config & CTA wiring

- [x] `resolveProductAppOrigin()` / `PUBLIC_PRODUCT_APP_URL` for marketing CTAs
- [x] `ProductAppLink` on nav **Dashboard**
- [x] Hero microcopy points users to the app (no hero CTA button)

### Epic 2 — Nav & footer

- [x] `MarketingNav`: Docs, Blog, FAQ, Pricing, Dashboard
- [x] Pricing and FAQ nav links use homepage anchors (`#pricing`, `#faq`)
- [x] `MarketingFooter`: product / resources / legal columns, GitHub
- [x] Mobile nav without JS fallback

### Epic 3 — Homepage

- [x] Default sections: hero, two feature rows, pricing, FAQ
- [x] `ProductFrame` with placeholder image
- [x] FAQ + `FAQPage` JSON-LD

### Epic 4 — Pricing

- [x] Homepage `#pricing`: 3 tiers, toggle, comparison table
- [x] `/[lang]/pricing` redirects to `#pricing`
- [x] Free tier prominent; template limits shown

### Epic 5 — Documentation

- [x] `/[lang]/docs` index and `/[lang]/docs/[slug]` with sidebar
- [x] Sample guides in `src/content/docs/`
- [x] Shared Markdown pipeline with blog

### Epic 6 — Blog

- [x] `type` on frontmatter; changelog badge; sample changelog post
- [x] Chronological index (no filter tabs)

### Epic 7 — Route stubs

- [x] Stub or minimal page for features, integrations, customers, security, about, legal
- [x] One example `/features/[slug]` prerendered
- [x] Stubs visibly marked as template placeholders

### Epic 8 — i18n & SEO

- [x] Canonical keys in `en` locale; parity script for other locales
- [x] OG tags; build emits sitemap

### Epic 9 — Tests

- [x] Playwright: nav **Dashboard** href matches product app origin
- [x] Playwright: pricing section on homepage + `/pricing` redirect
- [x] Playwright: docs nav and sample page
- [x] Playwright: blog list and post detail
- [x] Vitest: Markdown and docs loaders

## Out of scope (v0 template)

- Real product copy, logos, testimonials, legal text → [v1](../v1/README.md)
- Translated documentation bodies (chrome i18n only)
- CMS, A/B testing, video hero, interactive demo
- RSS (unless trivial)

## Phased build order

1. Shared tokens + system font stack (`@repo/tokens`, `app.css`)
2. Config + `ProductAppLink` (nav Dashboard) + nav/footer
3. Placeholder content module + homepage sections
4. Markdown pipeline (`marked`, `MarkdownContent`, `.prose-marketing`)
5. Blog + documentation routes and sample content
6. Homepage pricing section + `/pricing` redirect
7. Secondary route stubs + example feature slug
8. SEO plumbing + sitemap
9. i18n + Playwright

**F-03** marked `Shipped` in [feature-matrix.md](../feature-matrix.md).
