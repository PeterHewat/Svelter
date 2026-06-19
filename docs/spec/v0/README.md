# Phase v0 — Complete starter template

**Status:** Complete

## Goal

Ship a **complete monorepo template**: product app vertical slice, shared shell, and B2B marketing site — ready to clone, then customize per product in [v1](../v1/README.md).

v0 is **complete**. F-01 (tasks) and F-03 (marketing site) are **Shipped**. F-02 (theme + i18n shell) is **Demo** — the intentional terminal state for the product-app shell starter (see [shell.md](./shell.md)).

Read [cross-cutting.md](./cross-cutting.md) first for auth, env, and data model.

## Definition of done

### Product app

- [x] `/tasks` CRUD with auth and ownership checks
- [x] `/login` with Clerk (`SignIn` modal)
- [x] Degraded mode without env (home + setup instructions)
- [x] Vitest + Playwright coverage for shell UI
- [x] Theme + EN i18n shell at demo level — [shell.md](./shell.md)

### Marketing (template)

- [x] Marketing site (SSG, i18n, docs, blog, Inkeep-style shell) — [marketing.md](./marketing.md)

## Epics

| Epic               | Spec                           | Matrix status | Notes                                                 |
| ------------------ | ------------------------------ | ------------- | ----------------------------------------------------- |
| Sample tasks       | [tasks.md](./tasks.md)         | Shipped       | Vertical slice for Clerk + Convex                     |
| Theme + i18n shell | [shell.md](./shell.md)         | Demo          | Terminal for v0 — extend in fork if needed            |
| Marketing site     | [marketing.md](./marketing.md) | Shipped       | Self-serve signup, public pricing, product UI in hero |

## After v0

Clone the template and follow [v1 — Product launch from template](../v1/README.md).
