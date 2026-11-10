import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

/** Relative path to shared product config edited during setup. */
export const PRODUCT_TS_REL = "packages/config/product.ts";

/**
 * Runs `bun fmt` on one or more repo-relative paths (best effort; ignores failures).
 *
 * @param root - Repository root
 * @param relativePaths - Paths relative to `root`
 */
export function formatPaths(root: string, relativePaths: string[]): void {
  if (relativePaths.length === 0) {
    return;
  }
  const absolutePaths = relativePaths.map((relativePath) =>
    resolve(root, relativePath),
  );
  spawnSync("bun", ["fmt", "--no-script", ...absolutePaths], {
    cwd: root,
    stdio: "ignore",
  });
}

/**
 * Formats `packages/config/product.ts` after setup edits long string literals.
 *
 * @param root - Repository root
 */
export function formatProductTs(root: string): void {
  formatPaths(root, [PRODUCT_TS_REL]);
}
