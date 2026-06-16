/* eslint-disable no-console -- CLI wizard */
import { existsSync, lstatSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const NESTED_CONVEX_PKG = "convex/node_modules/convex";

/**
 * Returns whether `convex/node_modules/convex` is hoisted (symlink) or absent.
 *
 * Copied (non-symlink) installs make the Convex bundler treat package files as
 * deploy entry points and fail with Node API / esbuild errors.
 *
 * @param root - Repository root
 */
export function isConvexNodeModulesHoisted(root: string): boolean {
  const pkgPath = resolve(root, NESTED_CONVEX_PKG);
  if (!existsSync(pkgPath)) {
    return true;
  }
  return lstatSync(pkgPath).isSymbolicLink();
}

/**
 * Re-hoists `convex/node_modules` when Bun left physical package copies.
 *
 * @param root - Repository root
 * @returns Whether `convex/node_modules/convex` is hoisted after this step
 */
export async function ensureConvexNodeModulesHoisted(
  root: string,
): Promise<boolean> {
  if (isConvexNodeModulesHoisted(root)) {
    return true;
  }

  console.log(
    "\n○ convex/node_modules has copied packages (breaks Convex deploy) — re-hoisting…",
  );
  rmSync(resolve(root, "convex/node_modules"), {
    recursive: true,
    force: true,
  });

  const proc = Bun.spawn(["bun", "install"], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  if ((await proc.exited) !== 0) {
    return false;
  }

  if (!isConvexNodeModulesHoisted(root)) {
    console.warn(
      "○ convex/node_modules still not hoisted — run `rm -rf convex/node_modules && bun install` from the repo root",
    );
    return false;
  }

  console.log("✓ convex/node_modules re-hoisted");
  return true;
}
