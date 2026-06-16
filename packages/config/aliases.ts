import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(configDir, "../..");

const aliasTargets = {
  "@repo/utils": "packages/utils/src/index.ts",
  "@repo/ui-svelte": "packages/ui-svelte/src/index.ts",
  "@repo/test-utils": "packages/test-utils/src/index.ts",
  "@convex/api": "convex/_generated/api.js",
  "@convex/dataModel": "convex/_generated/dataModel.d.ts",
} as const;

const testUtilsSubpathTargets = {
  "@repo/test-utils/convex-svelte-setup":
    "packages/test-utils/src/mocks/convex-svelte-setup.ts",
} as const;

const utilsSubpathTargets = {
  "@repo/utils/env": "packages/utils/src/env.ts",
  "@repo/utils/theme": "packages/utils/src/theme.ts",
  "@repo/utils/i18n": "packages/utils/src/i18n.ts",
  "@repo/utils/storage": "packages/utils/src/storage.ts",
} as const;

export type RepoAliasKey = keyof typeof aliasTargets;

function resolveRepoPaths(
  targets: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(targets).map(([key, rel]) => [
      key,
      path.resolve(repoRoot, rel),
    ]),
  );
}

/**
 * Builds Vite/Vitest `resolve.alias` entries for selected workspace packages.
 *
 * @param keys - Package alias keys to include
 * @returns Map of alias → absolute path under the repo root
 */
export function createRepoAliases(
  keys: readonly RepoAliasKey[],
): Record<string, string> {
  const selected = Object.fromEntries(
    keys.map((key) => [key, aliasTargets[key]]),
  ) as Record<string, string>;
  const aliases = resolveRepoPaths(selected);
  let merged = aliases;
  if (keys.includes("@repo/utils")) {
    merged = { ...resolveRepoPaths(utilsSubpathTargets), ...merged };
  }
  if (keys.includes("@repo/test-utils")) {
    merged = { ...resolveRepoPaths(testUtilsSubpathTargets), ...merged };
  }
  return merged;
}

/** Aliases used by `apps/web` (Vite + Vitest). */
export const webAliasKeys = [
  "@repo/utils",
  "@repo/ui-svelte",
  "@repo/test-utils",
  "@convex/api",
  "@convex/dataModel",
] as const satisfies readonly RepoAliasKey[];

/** Aliases used by `packages/ui-svelte` Vitest. */
export const uiSvelteAliasKeys = [
  "@repo/utils",
  "@repo/test-utils",
] as const satisfies readonly RepoAliasKey[];

/** Aliases used by `packages/utils` Vitest. */
export const utilsAliasKeys = [
  "@repo/test-utils",
] as const satisfies readonly RepoAliasKey[];

export const dedupeWebVite = ["zustand"] as const;
