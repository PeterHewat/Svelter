import { describe, expect, it } from "vitest";
import { MARKETING_LOCALES } from "./i18n";
import { SUPPORTED_LOCALES } from "../init/constants";

describe("init.js locales", () => {
  it("matches MARKETING_LOCALES from i18n.ts", () => {
    expect(SUPPORTED_LOCALES).toEqual(MARKETING_LOCALES);
  });
});
