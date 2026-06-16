# ADR-001: Convex as the Backend over tRPC/Supabase

## Status

Accepted (auth provider updated to Clerk — see note below)

## Context

This project targets a multi-surface product (web app, marketing site) that requires:

- Real-time data synchronization across clients
- A type-safe API layer shared between frontend and backend
- Authentication integrated with the backend
- Minimal infrastructure management for a small team or solo developer
- A backend that works well in a Bun/TypeScript monorepo

Three candidates were evaluated:

| Concern                 | Convex                          | tRPC                                       | Supabase                              |
| ----------------------- | ------------------------------- | ------------------------------------------ | ------------------------------------- |
| Real-time sync          | ✅ Built-in reactive queries    | ❌ Requires separate WebSocket layer       | ✅ Realtime via Postgres CDC          |
| Type safety             | ✅ End-to-end, schema-derived   | ✅ End-to-end via TypeScript               | ⚠️ Generated types, can drift         |
| Infrastructure          | ✅ Fully managed                | ❌ Needs a server (Express, Next.js, etc.) | ✅ Fully managed                      |
| Auth integration        | ✅ Clerk JWT (or other OIDC)    | ⚠️ Manual JWT validation                   | ✅ Built-in (own auth or third-party) |
| Offline / optimistic UI | ✅ Built-in optimistic updates  | ❌ Manual                                  | ⚠️ Manual                             |
| Vendor lock-in          | ⚠️ Convex-specific query model  | ✅ Portable (any HTTP server)              | ⚠️ Supabase-specific APIs             |
| Local dev experience    | ✅ `convex dev` with hot reload | ✅ Runs anywhere                           | ✅ Local Docker stack                 |

### Why not tRPC?

tRPC requires you to own and operate the server layer. For this starter, the goal is to minimize infrastructure concerns. tRPC also has no built-in real-time story without adding WebSockets.

### Why not Supabase?

Supabase is strong for PostgreSQL teams. Convex was chosen for a simpler reactive query model, TypeScript-native schema, and built-in optimistic updates.

## Decision

Use **Convex** as the backend for database, API functions, and real-time subscriptions. Use **Clerk** for authentication; Convex validates Clerk JWTs via [`convex/auth.config.ts`](../../convex/auth.config.ts) (`CLERK_JWT_ISSUER_DOMAIN`, `applicationID: "convex"`).

The Convex schema is defined in [`convex/schema.ts`](../../convex/schema.ts) and functions in [`convex/tasks.ts`](../../convex/tasks.ts) serve as the example pattern for all backend logic.

## Consequences

**Positive:**

- Zero infrastructure to manage
- Real-time reactivity via `convex-svelte` `useQuery`
- End-to-end type safety from schema to Svelte components
- Clerk handles hosted sign-in, social providers, and session UX

**Negative / Risks:**

- **Vendor lock-in**: Convex functions are not portable without a rewrite
- **Document model**: Complex relational queries need careful index design
- **Consumption pricing**: Monitor function call volume at scale
- **Two vendors for auth**: Clerk + Convex JWT config must stay in sync per deployment
