# Phase v0 — Complete starter template

**Status:** Complete

## Goal

Ship a **complete monorepo template**: product app vertical slice, shared shell, and B2B **PLG** (product-led growth) marketing site — ready to clone, then customize per product in [v1](../v1/README.md).

v0 is **complete**. F-01 (tasks) and F-03 (marketing PLG — product-led growth) are **Shipped**. F-02 (theme + i18n shell) is **Demo** — the intentional terminal state for the product-app shell starter (see [shell.md](./shell.md)).

Read [cross-cutting.md](./cross-cutting.md) first for auth, env, and data model.

## Definition of done

### Product app

- [x] `/tasks` CRUD with auth and ownership checks
- [x] `/login` with Clerk (`SignIn` modal)
- [x] Degraded mode without env (home + setup instructions)
- [x] Vitest + Playwright coverage for shell UI
- [x] Theme + EN i18n shell at demo level — [shell.md](./shell.md)

### Marketing (template)

- [x] Demo landing: SSG, i18n, blog, minimal hero — [marketing.md](./marketing.md)
- [x] PLG (product-led growth) marketing shell — [marketing-plg.md](./marketing-plg.md)

## Epics

| Epic               | Spec                                   | Matrix status | Notes                                      |
| ------------------ | -------------------------------------- | ------------- | ------------------------------------------ |
| Sample tasks       | [tasks.md](./tasks.md)                 | Shipped       | Vertical slice for Clerk + Convex          |
| Theme + i18n shell | [shell.md](./shell.md)                 | Demo          | Terminal for v0 — extend in fork if needed |
| PLG marketing site | [marketing-plg.md](./marketing-plg.md) | Shipped       | Product-led growth marketing shell         |

## After v0

Clone the template and follow [v1 — Product launch from template](../v1/README.md).
