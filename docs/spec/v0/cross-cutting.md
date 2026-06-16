# Authentication

- **Web app:** Clerk via `svelte-clerk` when `PUBLIC_CONVEX_URL` and `PUBLIC_CLERK_PUBLISHABLE_KEY` are set (`apps/web/src/routes/+layout.svelte`).
- **Convex:** Clerk JWT validation in `convex/auth.config.ts` — `CLERK_JWT_ISSUER_DOMAIN` on each deployment.
- **Tasks (F-01):** All `api.tasks.*` handlers call `requireUserId()` — tasks are scoped to the Clerk user id (`identity.subject`).
- **Shell (F-02):** Home route (`/`) renders without Convex or auth when env is missing.

## Environment (degraded mode)

| Layer       | Where                     | Required for demo                                                             |
| ----------- | ------------------------- | ----------------------------------------------------------------------------- |
| Web         | `apps/web/.env.local`     | `PUBLIC_CONVEX_URL`, `PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (dev) |
| Convex dash | `CLERK_JWT_ISSUER_DOMAIN` | Clerk issuer for JWT validation                                               |

When Convex or Clerk env is missing, the web app shows setup instructions (`BackendSetup`) instead of crashing. Setup: [getting-started.md](../../getting-started.md).
