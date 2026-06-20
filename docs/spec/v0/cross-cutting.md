# Authentication

- **Web app:** Clerk via `svelte-clerk` when `PUBLIC_CONVEX_URL` and `PUBLIC_CLERK_PUBLISHABLE_KEY` are set (`apps/web/src/routes/+layout.svelte`).
- **Convex:** Clerk JWT validation in `convex/auth.config.ts` — `CLERK_JWT_ISSUER_DOMAIN` on each deployment.
- **Guest access:** Anonymous RS256 JWTs minted by `POST /auth/anonymous` on the deployment `.convex.site` URL. Env: `ANON_AUTH_ISSUER`, `ANON_AUTH_JWKS`, `ANON_AUTH_PRIVATE_KEY` (set by `bun run setup`).
- **Users table:** One canonical row per person. Guests have `clerkUserId` unset; sign-in sets `clerkUserId` and merges guest data via `users.mergeGuestSessionIntoAccount`. Profile fields sync from the Clerk JWT on sign-in (`fillMissing`) and from Clerk webhooks (`overwrite`).
- **Clerk webhook:** `POST /clerk-webhook` on the deployment `.convex.site` URL — required for production profile sync. Set `CLERK_WEBHOOK_SIGNING_SECRET` on Convex. See [setup-automation.md](../../setup-automation.md#clerk-webhook-to-convex-profile-sync).
- **Tasks (F-01):** Handlers scope tasks by `users._id`. Guests limited to 3 tasks.
- **Shell (F-02):** Home route (`/`) renders without Convex or auth when env is missing.

## Environment (degraded mode)

| Layer       | Where                          | Required for demo                                                             |
| ----------- | ------------------------------ | ----------------------------------------------------------------------------- |
| Web         | `apps/web/.env.local`          | `PUBLIC_CONVEX_URL`, `PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (dev) |
| Convex dash | `CLERK_JWT_ISSUER_DOMAIN`      | Clerk issuer for JWT validation                                               |
| Convex dash | `ANON_AUTH_*`                  | Anonymous guest JWT signing (setup generates)                                 |
| Convex dash | `CLERK_WEBHOOK_SIGNING_SECRET` | Production profile sync (optional in local dev)                               |

When Convex or Clerk env is missing, the web app shows setup instructions (`BackendSetup`) instead of crashing. Setup: [getting-started.md](../../getting-started.md).
