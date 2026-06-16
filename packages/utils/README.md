# @repo/utils

Shared utilities for the Svelter monorepo.

## Installation

This package is internal to the monorepo. Import via path alias or subpath:

```ts
import { cn } from "@repo/utils";
import { loadEnv, asString, asInt, asBoolean } from "@repo/utils/env";
import { useThemeStore } from "@repo/utils/theme";
```

Subpaths: `./env`, `./theme`, `./i18n`, `./storage`. Prefer narrow imports in new code.

## Package boundaries

What belongs here vs `@repo/ui-svelte` vs Convex is defined in [docs/adr/002-package-boundary-authoring.md](../../docs/adr/002-package-boundary-authoring.md).

## Utilities

### cn(...classes)

Merges class names, filtering out falsy values. Similar to `clsx` but lighter weight.

```ts
import { cn } from "@repo/utils";

cn("foo", "bar"); // "foo bar"
cn("base", isActive && "active");
cn("base", { active: isActive, disabled: isDisabled });
```

### loadEnv(schema, source?)

Type-safe environment variable loader.

```ts
import { loadEnv, asString, asInt, asBoolean } from "@repo/utils/env";

const env = loadEnv({
  DATABASE_URL: { key: "DATABASE_URL", parse: asString },
  PORT: { key: "PORT", parse: asInt, optional: true, defaultValue: 3000 },
  DEBUG: {
    key: "DEBUG",
    parse: asBoolean,
    optional: true,
    defaultValue: false,
  },
});
```

## Development

```bash
bun run --filter @repo/utils test
bun run --filter @repo/utils typecheck
bun run --filter @repo/utils build
```
