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
