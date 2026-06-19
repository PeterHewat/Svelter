# Product specifications

Implementation-ready specs: the acceptance criteria, UI surfaces, routes/APIs, and edge cases an agent or contributor needs to build a feature correctly. Specs are derived from the human-oriented docs (e.g. `product.md`, `architecture.md`) and are the source of truth for **what to build**; AGENTS.md remains the source of truth for **how to build it**.

> **Starter:** `feature-matrix.md` and `v0/` document the **completed** upstream template. `v1/` is post-clone product work.

## Structure

| Path                  | Purpose                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `feature-matrix.md`   | One row per capability, across all release phases (ID, feature, phase, actor, route/API, spec link, status) |
| `v0/`, `v1/`, … `vN/` | Per-phase detail: acceptance criteria, UI, API shapes, permissions, and edge cases                          |

**Phase meaning in this template:**

| Phase | Where             | Purpose                                                                           |
| ----- | ----------------- | --------------------------------------------------------------------------------- |
| `v0`  | Upstream template | **Complete starter** — tasks demo, product shell (demo), marketing site (shipped) |
| `v1`  | **After fork**    | **Launch your product** — copy, assets, pricing, legal, deploy                    |

Create a new `vN/` folder only when that phase is scheduled — keep earlier phases as matrix rows plus a summary in the human-oriented docs until then.

## Conventions

- **Feature matrix** is the index. Each row gets a stable ID (`F-01`, `F-02`, …), an actor, a route or API surface, a link to its detailed spec, and a **Status**:
  - `Planned` → not started
  - `In progress` → partial implementation
  - `Demo` → starter scaffolding shipped as a reference — **terminal state** when the phase is complete (e.g. F-02 product shell); replace or extend in your fork
  - `Shipped` → capability complete for the phase
- **Phase folder** (`vN/`) starts with a `README.md` (goal, epic index, definition of done, open decisions) and one file per epic. Keep epics small and implementable in order.
- **Cross-cutting** concerns shared by every epic in a phase (data model, permissions, lifecycles) go in `vN/cross-cutting.md` so individual epic files stay focused.
- Specs describe **intended** behaviour. When code disagrees with a spec, fix one of them — never let them silently diverge.

## Glossary

| Term    | Meaning                                                                                                                                                                                                               |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PLG** | **Product-led growth** — acquisition and conversion driven by self-serve signup, public pricing, and using the product (not sales-led “book a demo” as the primary motion). See [v0/marketing.md](./v0/marketing.md). |

## How to use

**Upstream template (Svelter repo):**

1. v0 is complete — see [v0/README.md](./v0/README.md) and [feature-matrix.md](./feature-matrix.md).
2. New capability in the template → add a matrix row or extend a v0 epic; bump status as it ships.

**After cloning for a product:**

1. Read [v1/README.md](./v1/README.md) and work through [v1/marketing-product.md](./v1/marketing-product.md).
2. Fill in `docs/product.md` and track your own `v2+` rows in the matrix when needed.
3. Pull upstream v0 improvements periodically; keep product work in the v1 checklist and `product.md`.

## Related

- `../product.md` — vision, phases, metrics (overview)
- `../architecture.md` — domains and design decisions
- `../monorepo-structure.md` — layout, packages, env layers
- `../adr/` — recorded architectural decisions
