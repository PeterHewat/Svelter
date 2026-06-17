#!/usr/bin/env bun
/**
 * Removes unused SvelteKit client JS bundles from the marketing SSG build.
 *
 * With `csr: false`, prerendered HTML does not hydrate, but the adapter still
 * emits `_app/immutable/{chunks,entry,nodes}` and `version.json`. Stripping them
 * shrinks the Cloudflare Pages upload; CSS under `_app/immutable/assets` stays.
 *
 * @example
 * bun scripts/strip-marketing-client-js.ts
 */
import { rmSync } from "node:fs";
import { resolve } from "node:path";

const buildDir = resolve(import.meta.dir, "../apps/marketing/build");

for (const rel of [
  "_app/immutable/chunks",
  "_app/immutable/entry",
  "_app/immutable/nodes",
  "_app/version.json",
] as const) {
  rmSync(resolve(buildDir, rel), { recursive: true, force: true });
}
