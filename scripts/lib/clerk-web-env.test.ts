import { afterEach, describe, expect, it } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  normalizeClerkProductionEnv,
  PUBLIC_CLERK_PUBLISHABLE_KEY,
} from "./clerk-web-env";

describe("normalizeClerkProductionEnv", () => {
  let root = "";

  afterEach(() => {
    if (root) {
      rmSync(root, { recursive: true, force: true });
      root = "";
    }
  });

  it("maps VITE_CLERK_PUBLISHABLE_KEY from clerk env pull", () => {
    root = mkdtempSync(join(tmpdir(), "clerk-web-env-"));
    const relPath = ".svelter/clerk-production.env";
    const envPath = join(root, relPath);
    mkdirSync(dirname(envPath), { recursive: true });
    writeFileSync(
      envPath,
      [
        "VITE_CLERK_PUBLISHABLE_KEY=unit-test-clerk-pub-fixture-01",
        "CLERK_SECRET_KEY=unit-test-clerk-sec-fixture-01",
      ].join("\n"),
      "utf8",
    );

    const env = normalizeClerkProductionEnv(root, relPath);
    expect(env[PUBLIC_CLERK_PUBLISHABLE_KEY]).toBe(
      "unit-test-clerk-pub-fixture-01",
    );
    expect(env.CLERK_SECRET_KEY).toBe("unit-test-clerk-sec-fixture-01");

    const written = readFileSync(envPath, "utf8");
    expect(written).toContain(
      `${PUBLIC_CLERK_PUBLISHABLE_KEY}=unit-test-clerk-pub-fixture-01`,
    );
  });
});
