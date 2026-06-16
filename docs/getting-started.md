# Getting started

Starter for a product web app (SvelteKit SPA), marketing site (SvelteKit SSG), and Convex backend with Clerk authentication. Shipping and CI are in [ci-cd.md](./ci-cd.md).

The template includes a small signed-in CRUD todo list (`/tasks`) to prove Clerk, Convex, and the web app work together. Use it as your setup check; replace it with your own product when you are ready.

[Prerequisites](./development.md#prerequisites): Git, Bun, Node, `gh`, plus GitHub, Convex, Clerk, and Vercel accounts. An apex domain is optional at first — add one when you are ready for custom hostnames.

## Local development

### 1. Create the repository

Use [**this template**](https://github.com/PeterHewat/Svelter/generate) on GitHub (not **Fork**), clone your repo, then:

```bash
bun install && bun run setup
```

### 2. Setup wizard (`bun run setup`)

Safe to **re-run anytime** (resume after interruptions). Each run re-asks questions with your previous answers as defaults (press **Enter** to keep).

| Step           | What it does                                                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CLI check**  | `gh` (global) + `bunx convex` / `bunx vercel` (devDependencies); runs login commands when needed — continue manually if tools are missing                                    |
| **Identity**   | Product name + tagline + optional apex domain (Enter to skip) + optional MIT LICENSE removal → [`.svelter/setup.json`](../.svelter/setup.json), `packages/config/product.ts` |
| **Convex**     | Runs `convex dev --once` (browser login if needed) → syncs `PUBLIC_CONVEX_URL` to `apps/web/.env.local`. Daily dev: `bun run dev:convex`                                     |
| **Codegen**    | Convex `_generated/` + optional Convex agent skills + readiness report (**exit 0** = ready for PRs)                                                                          |
| **GitHub**     | Sync dev CI secrets via `gh` (default **yes** first time) — `PUBLIC_CONVEX_URL`, E2E vars, `CONVEX_DEPLOY_KEY`                                                               |
| **Vercel**     | Two projects, web env vars, custom domains when apex is set, **Vercel DNS nameserver pause**, `VERCEL_*` → `gh` (default **yes** first time)                                 |
| **Production** | Defer until release: GitHub **`production`** environment for `release-*` (prod Convex deploy key + `PUBLIC_CONVEX_URL`)                                                      |

Dashboard URLs are printed as clickable links in setup steps — open them directly in your terminal or browser.

Details and fallbacks: [setup-automation.md](./setup-automation.md). **DNS (Vercel nameservers at your registrar):** [environments.md](./environments.md#dns-vercel-dns-at-your-registrar).

### 3. Clerk + Convex

After Convex is linked, interactive setup walks through Clerk:

1. Create a Clerk application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Enable the [Convex integration](https://dashboard.clerk.com/apps/setup/convex) in Clerk.
3. Setup uploads `CLERK_JWT_ISSUER_DOMAIN` to Convex and Clerk keys to `apps/web/.env.local`.
4. Enable sign-in methods (Google, email/password, etc.) in the Clerk dashboard — no per-provider cloud consoles.

For Playwright tasks E2E: run `bun run setup` to create a Clerk test user and write `E2E_USER_EMAIL` to `apps/web/.env.local`, plus `CLERK_SECRET_KEY` for the testing helper.

### 4. Run and verify the sample app

```bash
bun run dev:convex   # terminal 1
bun run dev:web      # terminal 2
bun run dev:marketing   # optional — terminal 3
```

- Web: [localhost:5173/tasks](http://localhost:5173/tasks)
- Marketing: [localhost:4321](http://localhost:4321)

Day-to-day commands: [development.md](./development.md#commands).

### 5. If setup fails

Resume `bun run setup`, or see [setup-automation.md](./setup-automation.md) for manual steps and dashboard URLs.

### 6. Before your first release

1. Green PR CI on `main` ([branch protection](./ci-cd.md#branch-protection)).
2. Merge to `main` — **Staging** deploys Convex dev + E2E; Vercel Git updates `preview.*` ([environments.md](./environments.md)).
3. Answer **yes** on the setup **Production** step (or add secrets manually) before running **Release** — [ci-cd.md](./ci-cd.md#production-environment-secrets).

---

## Next

- [Platform setup (domains, DNS, Clerk)](./environments.md)
- [Releases](./ci-cd.md#manual-workflows)
- [Replace the tasks demo](./spec/README.md) with your own specs
