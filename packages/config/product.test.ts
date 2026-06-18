import { describe, expect, it } from "vitest";
import { webDevOrigin } from "./dev-ports";
import {
  DOCS_URL,
  PRODUCT_APP_URL,
  PRODUCT_NAME,
  PRODUCT_SIGNUP_PATH,
  PRODUCT_TAGLINE,
} from "./product";

describe("product", () => {
  it("exports non-empty defaults for the template", () => {
    expect(PRODUCT_NAME.length).toBeGreaterThan(0);
    expect(PRODUCT_TAGLINE.length).toBeGreaterThan(0);
  });

  it("exports marketing CTA defaults", () => {
    expect(PRODUCT_APP_URL).toBe(webDevOrigin);
    expect(PRODUCT_SIGNUP_PATH).toBe("/sign-up");
    expect(DOCS_URL).toMatch(/^https:\/\//);
  });
});
