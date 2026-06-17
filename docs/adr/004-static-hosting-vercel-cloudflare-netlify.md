# ADR-004: Static hosting — Vercel vs Cloudflare Pages vs Netlify

## Status

Accepted — 2026-06-17

## Context

Svelter serves two static surfaces: a **product web SPA shell** (`apps/web`, `adapter-static` + `200.html` fallback) and a **marketing SSG** (`apps/marketing`, full prerender). **Convex** and **Clerk** run outside the host. The template needs:

- **Staging** on `staging.{project}.pages.dev` when `main` merges
- **Production** on apex + `www` when a `release-*` tag ships
- **GitHub Actions–only** deploys (no platform Git OAuth) so forks avoid linking Vercel/Cloudflare to GitHub for builds
- **Free tier** headroom for marketing traffic and monorepo adopters

Previously the template used **Vercel**: Git-linked staging on `main`, production via Actions `vercel deploy --prebuilt --prod`. Hobby limits (bandwidth, custom preview environments) and CLI-only staging friction motivated re-evaluation.

## Alternatives considered

| Dimension                                          | Vercel                                                             | Cloudflare Pages                                                 | Netlify                                        |
| -------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------- |
| Free-tier bandwidth / requests                     | Hobby caps; overages or Pro                                        | Effectively unlimited under fair use                             | Generous; build-minute limits on free          |
| Actions-only prebuilt upload                       | Staging relied on Git integration; CLI staging awkward on Hobby    | **Wrangler `pages deploy`** — no Git link required               | **`netlify deploy`** — direct upload supported |
| Staging + production without platform Git          | Production via Actions; staging needed Git hook or paid custom env | **`--branch=staging`** on `staging.*.pages.dev` branch aliases   | Branch deploys; similar direct-upload path     |
| Custom domains (production only, 2 hostnames)      | Mature; Vercel DNS delegation                                      | Zone on Cloudflare; staging on `*.pages.dev` (no preview CNAMEs) | Mature; `_redirects` / headers files           |
| SPA fallback + security headers                    | `vercel.json` rewrites + headers                                   | `_redirects` + `_headers` in build output                        | `_redirects` + `_headers`                      |
| Monorepo (2 projects, root install + filter build) | Per-app `vercel.json` (removed)                                    | Two direct-upload Pages projects                                 | Two Netlify sites or monorepo plugin           |
| Setup wizard / API automation                      | Mature API + Git noise tuning                                      | Pages + DNS API; no Git link simplifies bootstrap                | Solid CLI/API                                  |
| DNS ownership                                      | Vercel nameservers option                                          | **Cloudflare DNS** (registrar unchanged)                         | Netlify DNS or external                        |
| Adopter operational complexity                     | Low for Vercel-native teams                                        | Medium — DNS for production; staging on `*.pages.dev`            | Low–medium                                     |
| Lock-in / exit                                     | Static `build/` portable                                           | Static `build/` portable                                         | Static `build/` portable                       |

## Decision

Adopt **Cloudflare Pages** with **direct upload via Wrangler** from GitHub Actions for **both** staging (`main` → `--branch=staging`) and production (`release-*` → production deployment).

- Two Pages projects: `{slug}-web`, `{slug}-marketing`
- No Cloudflare ↔ GitHub OAuth; builds run in Actions with env baked at compile time
- Edge config (`_headers`, `_redirects`) emitted into `apps/*/build` at build time from `packages/config/pages-edge.ts`
- Setup wizard provisions projects, domains, and `CLOUDFLARE_*` / `CF_PAGES_PROJECT_*` GitHub secrets. Operational detail: [environments.md](../environments.md), [ci-cd.md](../ci-cd.md).

## Consequences

### Positive

- Avoids Vercel Hobby bandwidth / staging deploy limitations
- Uniform deploy path: staging and production both via Actions
- DNS + CDN in one place when the apex zone is on Cloudflare
- No Vercel Git bot noise or Production Branch gymnastics

### Negative

- Lose Vercel SvelteKit zero-config (`vercel.json` removed); headers/redirects maintained in-repo
- Setup wizard rewritten for Cloudflare API + production custom domains only
- Staging is served from `staging.{project}.pages.dev` after merge to `main` (no `preview.*` CNAMEs)
- Adopters already on Vercel must migrate DNS and secrets (Netlify remains a plausible fork alternative)

### Revisit when

- Cloudflare Pages limits or pricing change materially
- The template needs edge/server runtime (`adapter-cloudflare`) — out of scope for this ADR

## Related

- [environments.md](../environments.md)
- [ci-cd.md](../ci-cd.md)
- [ADR-003](./003-bun-native-monorepo-tasks-and-ci.md)
