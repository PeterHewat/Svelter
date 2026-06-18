# F-02: Theme + i18n shell

**Status:** Demo (terminal for v0)  
**Route:** `/`  
**Actor:** Visitor

F-02 is **complete for the v0 template** at **Demo** status. The product app ships with theme persistence, a header **language switcher**, and client-side locale storage via `@repo/utils/i18n`. **Demo** reflects starter depth (EN-first copy, no locale URLs on product routes) — not missing switcher UI.

## Acceptance criteria

- [x] Theme toggle persists preference (localStorage or in-memory fallback per `packages/utils/src/storage.ts`)
- [x] Copy via `@repo/utils/i18n` (`apps/web/src/lib/i18n.ts`) — EN canonical; eight additional locales lazy-loaded
- [x] `LanguageSwitcher` in app header (`apps/web/src/lib/components/app-header.svelte` → `@repo/ui-svelte`)
- [x] Home route renders without Convex or auth when env is missing

## Shipped (product app)

| Piece              | Where                                                                           |
| ------------------ | ------------------------------------------------------------------------------- |
| Language select    | `LanguageSwitcher` in `app-header.svelte`                                       |
| Locale persistence | `useI18nStore` (`localStorage`, shared with marketing `/init.js` key)           |
| Dictionaries       | `apps/web/src/lib/locales/*.ts`; non-`en` loaded on demand (`locale-loader.ts`) |

## Out of scope (starter — not required to ship v0)

- **Per-locale routing URLs** on the product app (e.g. `/fr/tasks`) — marketing uses `/[lang]/` separately; product SPA stays single-path
- **Server-side locale detection** — locale is client-chosen only
- **Full locale parity** when you add product keys — register and translate new keys per fork (marketing has the same EN-first pattern for new PLG copy)

## After fork

- Add or update keys in `apps/web/src/lib/locales/en.ts`, then translate other locales you ship
- Wire **locale-prefixed product URLs** only if you need shareable/bookmarkable language-specific paths (optional; switcher works without them)
- Align product copy depth with markets you target — marketing may already be ahead on locale coverage for new sections
