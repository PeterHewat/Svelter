import { describe, expect, it } from "vitest";
import {
  deriveAppOrigins,
  resolveMarketingOrigin,
  resolveProductAppOrigin,
} from "./app-origins";
import { marketingDevOrigin, webDevOrigin } from "./dev-ports";

describe("app-origins", () => {
  it("falls back to local dev origins", () => {
    expect(resolveProductAppOrigin()).toBe(webDevOrigin);
    expect(resolveMarketingOrigin()).toBe(marketingDevOrigin);
  });

  it("reads PUBLIC_PRODUCT_APP_URL from process.env", () => {
    const previous = process.env.PUBLIC_PRODUCT_APP_URL;
    process.env.PUBLIC_PRODUCT_APP_URL = "https://staging.acme-web.pages.dev";
    try {
      expect(resolveProductAppOrigin()).toBe(
        "https://staging.acme-web.pages.dev",
      );
    } finally {
      if (previous === undefined) {
        delete process.env.PUBLIC_PRODUCT_APP_URL;
      } else {
        process.env.PUBLIC_PRODUCT_APP_URL = previous;
      }
    }
  });

  it("reads PUBLIC_MARKETING_ORIGIN from process.env", () => {
    const previous = process.env.PUBLIC_MARKETING_ORIGIN;
    process.env.PUBLIC_MARKETING_ORIGIN =
      "https://staging.acme-marketing.pages.dev";
    try {
      expect(resolveMarketingOrigin()).toBe(
        "https://staging.acme-marketing.pages.dev",
      );
    } finally {
      if (previous === undefined) {
        delete process.env.PUBLIC_MARKETING_ORIGIN;
      } else {
        process.env.PUBLIC_MARKETING_ORIGIN = previous;
      }
    }
  });

  it("derives staging pages.dev hostnames", () => {
    expect(
      deriveAppOrigins({
        webProject: "acme-web",
        marketingProject: "acme-marketing",
        stagingBranch: "staging",
      }),
    ).toEqual({
      product: "https://staging.acme-web.pages.dev",
      marketing: "https://staging.acme-marketing.pages.dev",
    });
  });

  it("derives production pages.dev hostnames without apex", () => {
    expect(
      deriveAppOrigins({
        webProject: "acme-web",
        marketingProject: "acme-marketing",
      }),
    ).toEqual({
      product: "https://acme-web.pages.dev",
      marketing: "https://acme-marketing.pages.dev",
    });
  });

  it("derives apex + www production hostnames", () => {
    expect(
      deriveAppOrigins({
        webProject: "acme-web",
        marketingProject: "acme-marketing",
        apexDomain: "foobar.com",
      }),
    ).toEqual({
      product: "https://foobar.com",
      marketing: "https://www.foobar.com",
    });
  });
});
