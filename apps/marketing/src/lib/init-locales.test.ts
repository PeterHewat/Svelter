import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { MARKETING_LOCALES } from "./i18n";

const initPath = resolve(import.meta.dirname, "../../static/init.js");

/**
 * Parses `SUPPORTED_LOCALES` from static init.js for parity checks.
 */
function readInitLocaleCodes(): string[] {
  const init = readFileSync(initPath, "utf8");
  const match = init.match(/var SUPPORTED_LOCALES = (\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error("SUPPORTED_LOCALES not found in static/init.js");
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
