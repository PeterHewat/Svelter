# F-03: PLG marketing site (template)

**PLG** = **product-led growth** — self-serve signup, public pricing, and the product UI as the main conversion path (not “book a demo” as the primary CTA). This spec defines the marketing site patterns for that motion.

**Status:** Shipped  
**Surface:** `apps/marketing` (upstream Svelter template)  
**Actor:** Template maintainer  
**Phase:** v0  
**Extends:** [marketing.md](./marketing.md) (demo landing already shipped)  
**Adopter follow-up:** [v1/marketing-product.md](../v1/marketing-product.md)

## Scope

**In v0 (template):** Components, routes, config wiring, placeholder content, EN i18n keys, SEO plumbing, tests.

**Not in v0 ([v1](../v1/README.md)):** Real positioning, customer assets, production legal, full locale translation, analytics.

## Already shipped (demo landing)

See [marketing.md](./marketing.md): static build, i18n routes, blog, minimal hero. The PLG shell below extends that demo.

## PLG (product-led growth) principles (wired into template defaults)

- **Primary CTA everywhere:** “Start free” → product app signup (not “Book a demo”).
- **Pricing is public** — free tier visually prominent with **example** limits.
- **Product UI in hero** — placeholder screenshot in `ProductFrame`; adopter swaps image in v1.
- **FAQ** includes free-plan objection handling (template copy).
- **Restraint over motion** — minimal animation; respect `prefers-reduced-motion`.

## Reference sites

Curated for B2B SaaS product-led growth. v0 implements **patterns**; v1 fills **copy and assets**. Borrow layouts selectively.

### Primary PLG (product-led growth) references

| Site                                    | What they do well                                                                                                                                                | Borrow for template                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [Linear](https://linear.app)            | The product UI _is_ the pitch. Dark, restrained aesthetic. Sharp one-line positioning. Public changelog as marketing. Keyboard-first brand without clutter.      | `ProductFrame` hero, changelog posts in blog, minimal motion, sticky nav + single CTA |
| [Notion](https://notion.so)             | Free-forever tier is central to growth. Benefit-led copy for multiple personas. Template gallery drives organic signup. Calm whitespace and soft illustration.   | Free tier prominence on pricing, section structure for use-case cards                 |
| [Better Stack](https://betterstack.com) | Operational credibility: uptime, monitoring, logging as trust signals. Changelog + blog + docs feel like one product surface. Clear tier limits on pricing.      | Changelog filter on blog, metrics strip slot, FAQ on limits                           |
| [Vercel](https://vercel.com)            | Performance as brand — the site is fast because the product is about speed. Developer-grade polish without being cold. Logo bar + deployment screenshot in hero. | Core Web Vitals discipline, logo bar slot, screenshot in hero                         |
| [Resend](https://resend.com)            | Radical simplicity for a technical product. One clear value prop, minimal nav, immediate “Get started”. Code snippets as social proof for developers.            | Hero brevity, single dominant CTA, tight section rhythm                               |
| [Supabase](https://supabase.com)        | Open-source positioning with enterprise credibility. Feature grid that maps to real product areas. Pricing calculator feel — limits are transparent.             | Integrations grid component, feature rows, explicit free-tier limit slots             |
| [Clerk](https://clerk.com)              | Shows the actual UI components in marketing — the product sells itself. Clean docs link in nav. Free tier with clear upgrade path.                               | Docs in nav, pricing comparison table                                                 |
| [Raycast](https://raycast.com)          | Personality without sacrificing B2B polish. Short demo loops and extension marketplace as proof of ecosystem. “Download / Get started” friction-free CTA.        | Testimonial block, integrations teaser, polished dark mode                            |

### Trust, pricing & credibility

| Site                           | What they do well                                                                                                                                                                                | Borrow for template                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| [Stripe](https://stripe.com)   | Information architecture at scale — every product gets a landing page. Precision typography and grid. Trust through restraint, not hype. Pricing and docs are always one click away.             | Footer sitemap depth, `/features/[slug]` route pattern, FAQ schema, legal stub routes |
| [Mercury](https://mercury.com) | Financial-grade trust through whitespace and typography — no stock photos, no clutter. Speaks to a specific buyer (startups) immediately. Security and compliance surfaced without a sales call. | `security` stub page, whitespace in `Section`, testimonial component                  |
| [Ramp](https://ramp.com)       | Quantified outcomes in headlines (“save X hours”). Before/after framing vs. spreadsheets. Logo bar with recognizable brands. Comparison tables that respect the reader’s time.                   | Metrics strip, logo bar, comparison table on pricing                                  |
| [Asana](https://asana.com)     | Use-case segmentation by team (Marketing, Ops, Engineering). Feature deep-dives with workflow context, not feature lists. Enterprise path exists but doesn’t overshadow self-serve.              | Use-case section slots on homepage, one example `/features/[slug]`                    |

### Anti-patterns (template and product)

| Pattern                                  | Why we skip it                                              |
| ---------------------------------------- | ----------------------------------------------------------- |
| “Book a demo” as primary CTA             | Sales-led, not default PLG                                  |
| Hidden pricing                           | Conflicts with transparent free tier                        |
| Video autoplay hero                      | Performance; out of scope                                   |
| Interactive product builder in marketing | Heavy JS; conflicts with `csr: false`                       |
| Fake customer logos presented as real    | Template uses labeled placeholders; v1 uses real or removes |

## Shared config

Add to `packages/config/product.ts` (adopters change in v1):

| Export                | Purpose                     | Example (template)         |
| --------------------- | --------------------------- | -------------------------- |
| `PRODUCT_APP_URL`     | Product SPA origin          | `http://localhost:3000`    |
| `PRODUCT_SIGNUP_PATH` | Signup route on product app | `/sign-up`                 |
| `DOCS_URL`            | External docs (nav/footer)  | `https://docs.example.com` |

Marketing CTAs compose: `` `${PRODUCT_APP_URL}${PRODUCT_SIGNUP_PATH}` ``.

Optional UTM: `?utm_source=marketing&utm_medium=cta&utm_campaign={page}`.

## Placeholder content module

Centralize template copy and section toggles in `apps/marketing/src/lib/marketing-content.ts` (or equivalent):

- Section order and `enabled` flags (so adopters disable LogoBar, Testimonial, etc. without deleting components)
- Placeholder tier limits, metrics, FAQ items, feature row titles
- Document each field with a short comment: “replace in v1”

Components read from this module + i18n for labels (`mt()`). **No product-specific story hardcoded in components.**

## Site map (template)

| Route                     | Template deliverable                            | Prerender |
| ------------------------- | ----------------------------------------------- | --------- |
| `/[lang]/`                | Homepage — all sections, placeholder content    | Yes       |
| `/[lang]/pricing`         | Full pricing UI, template tier data             | Yes       |
| `/[lang]/features`        | Stub or minimal overview                        | Yes       |
| `/[lang]/features/[slug]` | **One** example deep-dive                       | Yes       |
| `/[lang]/integrations`    | Stub or empty grid with “add integrations” note | Yes       |
| `/[lang]/customers`       | Stub                                            | Yes       |
| `/[lang]/security`        | Stub sections (placeholder subprocessors table) | Yes       |
| `/[lang]/about`           | Stub                                            | Yes       |
| `/[lang]/blog`            | Articles + changelog; filter tabs               | Yes       |
| `/[lang]/blog/[slug]`     | Post detail                                     | Yes       |
| `/[lang]/legal/privacy`   | Placeholder — “replace before launch” banner    | Yes       |
| `/[lang]/legal/terms`     | Placeholder — “replace before launch” banner    | Yes       |

**External links (nav/footer):** Docs (`DOCS_URL`), GitHub (`GITHUB_REPO_URL`). Status link optional stub.

## Navigation

```text
[Logo → home]  Features  Pricing  Blog     [Lang] [Theme] [Log in ↗] [Start free →]
```

- **Log in** → `PRODUCT_APP_URL`
- **Start free** → signup URL (primary button)
- Mobile: drawer + `Start free` visible without opening drawer; works without JS (static fallback)

## Homepage sections

Composable blocks — all implemented in v0; content from placeholder module:

1. **Hero** — `ProductFrame`, dual CTA, “No credit card required”
2. **Logo bar** — placeholder logos (labeled in comments)
3. **How it works** — 3 steps
4. **Feature rows** (×3)
5. **Metrics strip** — placeholder stats
6. **Pricing teaser** — links to `/pricing`
7. **Testimonial** — placeholder quote
8. **Integrations teaser**
9. **FAQ** — template PLG objections + `FAQPage` JSON-LD
10. **CTA band**
11. **Footer**

## Pricing page (template data)

| Tier         | Template default                               |
| ------------ | ---------------------------------------------- |
| **Free**     | $0 forever — visually dominant; example limits |
| **Pro**      | Placeholder price — “Most popular” badge       |
| **Business** | Placeholder price                              |

UI: monthly/annual toggle, tier CTAs → signup, comparison table, FAQ, optional Enterprise stub row, CTA band.

## Components

`apps/marketing/src/lib/components/` unless shared via `@repo/ui-svelte`:

| Component          | Responsibility                                               |
| ------------------ | ------------------------------------------------------------ |
| `ProductAppLink`   | Signup/login URLs from config + optional UTM                 |
| `MarketingNav`     | Sticky nav, mobile drawer, CTAs                              |
| `Hero`             | Headline, dual CTA, screenshot slot, micro-copy              |
| `ProductFrame`     | Browser chrome wrapper for screenshots                       |
| `LogoBar`          | Customer logo grid                                           |
| `HowItWorks`       | 3-step PLG onboarding story                                  |
| `FeatureRow`       | Alternating image + copy                                     |
| `MetricsStrip`     | 3-column stats                                               |
| `PricingTeaser`    | Homepage tier summary                                        |
| `PricingTable`     | Full pricing page cards + matrix                             |
| `PricingToggle`    | Monthly/annual switch                                        |
| `Testimonial`      | Quote block                                                  |
| `IntegrationsGrid` | Logo grid with names                                         |
| `Faq`              | Accordion + JSON-LD                                          |
| `CtaBand`          | Full-width conversion repeat                                 |
| `MarketingFooter`  | Sitemap, legal, external links                               |
| `Section`          | Consistent vertical rhythm + `container`                     |
| `BlogIndex`        | All / Articles / Changelog tabs (CSS radio filter; see Blog) |

All user-visible **labels** via `mt()`; section **body copy** from content module or i18n.

## Blog (articles + changelog)

One pipeline: `src/content/blog/`. No separate changelog route.

| Field                             | Required | Values                           |
| --------------------------------- | -------- | -------------------------------- |
| `type`                            | No       | `article` (default), `changelog` |
| `version`                         | No       | string (changelog)               |
| `title`, `description`, `pubDate` | Yes      | —                                |
| `author`                          | No       | string (articles)                |

- Filter tabs: All / Articles / Changelog via **CSS radio labels** (same no-JS pattern as `PricingTable` — SvelteKit static prerender cannot read `url.searchParams` on `csr: false` pages)
- Samples: keep `hello-world.md` (`article`); add one `changelog` sample

## SEO & meta (plumbing)

- [x] Unique `<title>` and `meta description` per route via i18n (template copy)
- [x] OG + Twitter tags on homepage and pricing
- [x] `FAQPage` JSON-LD on homepage FAQ
- [x] `hreflang` alternates (existing layout)
- [x] `sitemap.xml` at build (all locales + routes above)
- [x] Canonical URLs per locale path

## Technical constraints

Do not regress existing marketing foundations:

- `adapter-static`, `csr: false`
- No Convex or Clerk on marketing routes
- `@repo/tokens`, theme via `/init.js`
- Locale routes under `/[lang]/`

## Acceptance criteria

### Epic 1 — Config & CTA wiring

- [x] `PRODUCT_APP_URL`, `PRODUCT_SIGNUP_PATH`, `DOCS_URL` in `@repo/config/product`
- [x] `ProductAppLink` on all primary CTAs
- [x] Hero primary CTA → signup (replaces “Read the blog”)

### Epic 2 — Nav & footer

- [x] `MarketingNav`: Features, Pricing, Blog, Log in, Start free
- [x] `MarketingFooter`: sitemap columns, legal links, docs/GitHub
- [x] Mobile nav without JS fallback

### Epic 3 — Homepage

- [x] All 11 sections render; content from placeholder module
- [x] `ProductFrame` with placeholder image
- [x] FAQ + `FAQPage` JSON-LD

### Epic 4 — Pricing

- [x] `/[lang]/pricing`: 3 tiers, toggle, comparison table, FAQ
- [x] Free tier prominent; template limits shown
- [x] Tier CTAs → signup

### Epic 5 — Route stubs

- [x] Stub or minimal page for features, integrations, customers, security, about, legal
- [x] One example `/features/[slug]` prerendered
- [x] Stubs visibly marked as template placeholders

### Epic 6 — Blog content types

- [x] `type` on frontmatter; filter tabs; sample changelog post

### Epic 7 — i18n & SEO

- [x] New keys in `en` locale; README note for translating other locales in v1
- [x] OG tags; build emits sitemap

### Epic 8 — Tests

- [x] Playwright: `Start free` href matches config
- [x] Playwright: pricing renders 3 tiers
- [x] Playwright: changelog filter lists sample post

## Out of scope (v0 template)

- Real product copy, logos, testimonials, legal text → [v1](../v1/README.md)
- Full `MARKETING_LOCALES` parity for new marketing keys
- CMS, analytics SDK, A/B testing, video hero, interactive demo
- RSS (unless trivial)

## Phased build order

1. Config + `ProductAppLink` + nav/footer
2. Placeholder content module + homepage sections
3. Pricing page
4. Blog content types
5. Secondary route stubs + example feature slug
6. SEO plumbing
7. EN i18n + Playwright

## Evolution from demo landing

| Demo landing (shipped)              | Full PLG shell (v0 target)                   |
| ----------------------------------- | -------------------------------------------- |
| Hero CTA → blog                     | Hero CTA → signup; blog in nav               |
| 3-column feature grid               | Feature rows + how-it-works                  |
| `SiteFooter` from `@repo/ui-svelte` | `MarketingFooter` or extended shared footer  |
| Blog (`article` only)               | Blog with `type` frontmatter + index filters |
| Inline page copy                    | `marketing-content.ts` + i18n labels         |

**F-03** marked `Shipped` in [feature-matrix.md](../feature-matrix.md).
