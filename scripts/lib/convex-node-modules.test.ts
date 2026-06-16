import { afterEach, describe, expect, test } from "bun:test";
import {
  existsSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import {
  ensureConvexNodeModulesHoisted,
  isConvexNodeModulesHoisted,
} from "./convex-node-modules";

const tmpRoot = resolve(import.meta.dir, ".tmp-convex-node-modules-test");

function resetTmp(): void {
  rmSync(tmpRoot, { recursive: true, force: true });
  mkdirSync(resolve(tmpRoot, "convex/node_modules"), { recursive: true });
}

afterEach(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

describe("isConvexNodeModulesHoisted", () => {
  test("returns true when nested convex package is absent", () => {
    resetTmp();
    expect(isConvexNodeModulesHoisted(tmpRoot)).toBe(true);
  });

  test("returns true when nested convex package is a symlink", () => {
    resetTmp();
    const target = resolve(tmpRoot, "target-convex");
    mkdirSync(target);
    symlinkSync(target, resolve(tmpRoot, "convex/node_modules/convex"));
    expect(isConvexNodeModulesHoisted(tmpRoot)).toBe(true);
  });

  test("returns false when nested convex package is a copied directory", () => {
    resetTmp();
    mkdirSync(resolve(tmpRoot, "convex/node_modules/convex"));
    writeFileSync(
      resolve(tmpRoot, "convex/node_modules/convex/package.json"),
      "{}",
    );
    expect(isConvexNodeModulesHoisted(tmpRoot)).toBe(false);
  });
});

describe("ensureConvexNodeModulesHoisted", () => {
  test("is a no-op when already hoisted", async () => {
    resetTmp();
    const target = resolve(tmpRoot, "target-convex");
    mkdirSync(target);
    symlinkSync(target, resolve(tmpRoot, "convex/node_modules/convex"));
    await expect(ensureConvexNodeModulesHoisted(tmpRoot)).resolves.toBe(true);
    expect(existsSync(resolve(tmpRoot, "convex/node_modules/convex"))).toBe(
      true,
    );
  });
});
