import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { MARKETING_LOCALES } from "./i18n";

const constantsPath = resolve(import.meta.dirname, "../init/constants.js");

/**
 * Parses `SUPPORTED_LOCALES` from init source for parity checks.
 */
function readInitLocaleCodes(): string[] {
  const source = readFileSync(constantsPath, "utf8");
  const match = source.match(
    /export const SUPPORTED_LOCALES = (\[[\s\S]*?\]);/,
  );
  if (!match) {
    throw new Error("SUPPORTED_LOCALES not found in src/init/constants.js");
  }
  return JSON.parse(
    match[1].replace(/\s+/g, "").replace(/,(\])/g, "$1"),
  ) as string[];
}

describe("init.js locales", () => {
  it("matches MARKETING_LOCALES from i18n.ts", () => {
    expect(readInitLocaleCodes()).toEqual(MARKETING_LOCALES);
  });
});
