import { describe, expect, it } from "vitest";
import { productAppHref } from "./product-links";

describe("productAppHref", () => {
  it("returns # when product origin is not baked (runtime via init.js)", () => {
    expect(productAppHref()).toBe("#");
    expect(productAppHref({ lang: "fr" })).toBe("#");
    expect(productAppHref({ auth: true })).toBe("#");
  });
});
