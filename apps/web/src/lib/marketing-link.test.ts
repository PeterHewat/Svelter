import { describe, expect, it } from "vitest";
import { marketingDevOrigin } from "@repo/config/dev-ports";
import { marketingHomeHref, marketingSiteHref } from "./marketing-link";

describe("marketingSiteHref", () => {
  it("defaults to the local marketing dev origin", () => {
    expect(marketingSiteHref()).toBe(`${marketingDevOrigin}/?theme=light`);
    expect(marketingSiteHref("en")).toBe(
      `${marketingDevOrigin}/en?theme=light`,
    );
  });

  it("builds localized home URLs", () => {
    expect(marketingHomeHref("fr", { theme: "dark" })).toBe(
      `${marketingDevOrigin}/fr?theme=dark`,
    );
  });
});
