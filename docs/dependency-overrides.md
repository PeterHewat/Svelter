# Dependency overrides

Root [package.json](../package.json) `overrides` pin **transitive** dependency versions for security fixes. Run `bun run audit` after changing them. **Keep the version column in this table aligned with `package.json` on every override change.**

| Package             | Override   | Reason                                                                                                                 |
| ------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| `ws`                | `^8.21.0`  | ReDoS / security advisories in older 8.x                                                                               |
| `devalue`           | `^5.8.1`   | SSR serialization; keep on patched 5.x                                                                                 |
| `minimatch`         | `^10.2.5`  | ReDoS in older minimatch                                                                                               |
| `glob`              | `^13.0.6`  | Aligns with minimatch 10.x tree                                                                                        |
| `test-exclude`      | `^8.0.0`   | Coverage tooling chain                                                                                                 |
| `brace-expansion`   | `^5.0.7`   | ReDoS in older brace-expansion                                                                                         |
| `picomatch`         | `^4.0.5`   | Aligns with tooling that depends on picomatch 4                                                                        |
| `yaml`              | `^2.9.0`   | [GHSA-48c2-rrv3-qjmp](https://github.com/advisories/GHSA-48c2-rrv3-qjmp) (stack overflow in nested YAML)               |
| `@tootallnate/once` | `^3.0.1`   | [GHSA-vpq2-c234-7xj6](https://github.com/advisories/GHSA-vpq2-c234-7xj6) (transitive tooling)                          |
| `smol-toml`         | `^1.7.0`   | [GHSA-v3rj-xjv7-4jmq](https://github.com/advisories/GHSA-v3rj-xjv7-4jmq) (transitive tooling)                          |
| `tar`               | `^7.5.19`  | [GHSA-83g3-92jg-28cx](https://github.com/advisories/GHSA-83g3-92jg-28cx) (transitive extraction)                       |
| `srvx`              | `^0.11.21` | [GHSA-p36q-q72m-gchr](https://github.com/advisories/GHSA-p36q-q72m-gchr) (transitive tooling)                          |
| `path-to-regexp`    | `^8.4.2`   | [GHSA-9wv6-86v2-598j](https://github.com/advisories/GHSA-9wv6-86v2-598j) (transitive tooling pins)                     |
| `undici`            | `^8.7.0`   | Multiple GHSA advisories in Wrangler / tooling transitive tree                                                         |
| `esbuild`           | `^0.28.1`  | [GHSA-gv7w-rqvm-qjhr](https://github.com/advisories/GHSA-gv7w-rqvm-qjhr) (binary integrity in Deno API)                |
| `js-cookie`         | `^3.0.8`   | [GHSA-qjx8-664m-686j](https://github.com/advisories/GHSA-qjx8-664m-686j) (`svelte-clerk` → `@clerk/shared` pins 3.0.5) |

Re-add an override only when `bun audit` reports a vulnerable range and upstream has not released a fix.

## Ignored advisories

`bun run audit` (also what CI runs) ignores advisories that have no fixed release and only reach
tooling that never ships. Remove each ignore once its reason is gone.

| Advisory                                                                 | Package        | Why it is ignored                                                                                                                                                                                              |
| ------------------------------------------------------------------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | `braces@3.0.3` | No fixed release. Reached only through `@clerk/ui` → Solana wallet adapter → `react-native` (an installed peer) → `metro` → `micromatch`; nothing ships it. Goes away with the move from Clerk to Better Auth. |

**`ajv`:** No global override. ESLint 10 requires ajv 6 (`json-schema-draft-04`); forcing ajv 8.x breaks `bun run lint`. Bun applies overrides tree-wide (no per-package scoping). [GHSA-2g4f-4pwh-qvx6](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6) is **moderate** and only affects the `$data` option; ESLint’s ajv 6.14+ includes the backport. `bun run audit` uses `--audit-level=high` (same as CI) so this advisory does not fail the gate.
