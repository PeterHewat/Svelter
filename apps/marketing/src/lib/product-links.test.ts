import { describe, expect, it } from "vitest";
import { webDevOrigin } from "@repo/config/dev-ports";
import { productAppHref } from "./product-links";

describe("productAppHref", () => {
  it("builds signup URL from config", () => {
    expect(productAppHref()).toBe(`${webDevOrigin}/sign-up`);
  });

  it("builds login URL to product app home", () => {
    expect(productAppHref({ kind: "login" })).toBe(`${webDevOrigin}/`);
  });

  it("appends UTM params when campaign is set", () => {
    expect(productAppHref({ utmCampaign: "hero" })).toBe(
      `${webDevOrigin}/sign-up?utm_source=marketing&utm_medium=cta&utm_campaign=hero`,
    );
  });
});
