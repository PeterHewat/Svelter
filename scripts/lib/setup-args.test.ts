import { describe, expect, test } from "vitest";
import { parseSetupFlags } from "./setup-args";

describe("parseSetupFlags", () => {
  test("detects --sync-secrets", () => {
    expect(parseSetupFlags(["bun", "scripts/setup.ts"])).toEqual({
      syncSecrets: false,
    });
    expect(
      parseSetupFlags(["bun", "scripts/setup.ts", "--sync-secrets"]),
    ).toEqual({ syncSecrets: true });
  });
});
