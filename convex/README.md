# Convex

Backend for the web app. Setup: [docs/getting-started.md](../docs/getting-started.md).

```text
convex/
  schema.ts        # users + tasks tables (starter — extend for your domain)
  auth.config.ts   # Clerk JWT + optional anonymous (customJwt) providers
  http.ts          # HTTP actions: /auth/anonymous, /clerk-webhook
  crons.ts         # Scheduled jobs (empty starter)
  tasks.ts         # sample — list/create/update/remove (delete with the tasks slice)
  users.ts         # accountStatus, Clerk sync, anonymous + guest-merge mutations
  lib/
    auth.ts            # requireIdentity / requireUser / requireGuestStatus
    anon_auth.ts       # anonymous JWT subject / issuer helpers
    anonymous_session.ts # mints guest JWTs (RS256 via jose) for the HTTP action
    env.ts             # requireEnv — dashboard env (CLERK_JWT_ISSUER_DOMAIN, ANON_AUTH_*)
    validation.ts       # task title/description length limits
    constants.ts       # task quotas, JWT audience, anon id prefix
  model/
    tasks.ts          # owned-task loading, build/patch, completion filter
    users.ts          # user lookup/create, Clerk profile sync, guest detection
  _test.setup.ts      # convex-test module glob (excludes tests + _generated)
  *.test.ts           # convex-test suites (vitest)
```

Env (Convex dashboard, per deployment — dev and production each need their own `ANON_AUTH_*` values; `bun run setup` syncs both):

| Variable                       | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| `CLERK_JWT_ISSUER_DOMAIN`      | Clerk Frontend API URL (JWT issuer)                 |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Clerk webhook → `user.*` profile sync               |
| `ANON_AUTH_ISSUER`             | Deployment `.convex.site` origin (guest JWT issuer) |
| `ANON_AUTH_JWKS`               | Base64 data URI JWKS for the guest key pair         |
| `ANON_AUTH_PRIVATE_KEY`        | PEM RS256 private key (HTTP action signing only)    |

## Schema changes

`schema.ts` is a starter — extend it for your domain. Convex applies schema updates on deploy; existing production data is not rolled back when you redeploy an older `release-*` tag ([Deploy rollback limits](../docs/ci-cd.md#deploy)).

For breaking changes, use a widen → migrate → narrow rollout ([Convex schema guide](https://docs.convex.dev/database/schemas)). After `bun run setup`, the **convex-migration-helper** agent skill (under `.agents/skills/`) documents zero-downtime patterns with `@convex-dev/migrations`.

[Convex docs](https://docs.convex.dev/) · [Clerk + Convex](https://docs.convex.dev/auth/clerk)
