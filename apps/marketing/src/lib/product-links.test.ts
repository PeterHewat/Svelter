import { describe, expect, it } from "vitest";
import { webDevOrigin } from "@repo/config/dev-ports";
import { productAppHref } from "./product-links";

describe("productAppHref", () => {
  it("builds product app root URL", () => {
    expect(productAppHref()).toBe(`${webDevOrigin}/`);
  });

  it("forwards locale for cross-app preference sync", () => {
    expect(productAppHref({ lang: "fr" })).toBe(`${webDevOrigin}/?lang=fr`);
  });

  it("forwards resolved theme when provided", () => {
    expect(productAppHref({ lang: "en", theme: "dark" })).toBe(
      `${webDevOrigin}/?lang=en&theme=dark`,
    );
  });
});
