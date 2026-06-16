# F-02: Theme + i18n shell

**Status:** Demo (starter)  
**Route:** `/`  
**Actor:** Visitor

## Acceptance criteria

- [x] Theme toggle persists preference (localStorage or in-memory fallback per `packages/utils/src/storage.ts`)
- [x] English copy via `@repo/utils/i18n` (`apps/web/src/lib/i18n.ts`)
- [x] Home route renders without Convex or auth when env is missing

## Out of scope (starter)

- Language switcher UI (infrastructure supports more locales; only `en` is registered)
- Per-locale routing URLs
- Server-side locale detection
