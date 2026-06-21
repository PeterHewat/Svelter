import { describe, expect, it } from "vitest";
import {
  resolveApexMarketingOrigin,
  resolveMarketingSiteOrigin,
  resolveProductSiteOrigin,
  resolveSiblingAppOrigin,
} from "./cross-app-origin";

describe("resolveSiblingAppOrigin", () => {
  it("uses port ±1 for local dev and preview", () => {
    expect(
      resolveSiblingAppOrigin(
        { hostname: "localhost", port: "3001", protocol: "http:" },
        "marketing",
      ),
    ).toBe("http://localhost:3000");
    expect(
      resolveSiblingAppOrigin(
        { hostname: "localhost", port: "3000", protocol: "http:" },
        "web",
      ),
    ).toBe("http://localhost:3001");
    expect(
      resolveSiblingAppOrigin(
        { hostname: "localhost", port: "4001", protocol: "http:" },
        "marketing",
      ),
    ).toBe("http://localhost:4000");
    expect(
      resolveSiblingAppOrigin(
        { hostname: "localhost", port: "4000", protocol: "http:" },
        "web",
      ),
    ).toBe("http://localhost:4001");
  });

  it("swaps -web / -marketing on pages.dev (staging and prod)", () => {
    expect(
      resolveSiblingAppOrigin(
        {
          hostname: "staging.acme-marketing.pages.dev",
          port: "",
          protocol: "https:",
        },
        "marketing",
      ),
    ).toBe("https://staging.acme-web.pages.dev");
    expect(
      resolveSiblingAppOrigin(
        {
          hostname: "staging.acme-web.pages.dev",
          port: "",
          protocol: "https:",
        },
        "web",
      ),
    ).toBe("https://staging.acme-marketing.pages.dev");
    expect(
      resolveSiblingAppOrigin(
        {
          hostname: "acme-marketing.pages.dev",
          port: "",
          protocol: "https:",
        },
        "marketing",
      ),
    ).toBe("https://acme-web.pages.dev");
    expect(
      resolveSiblingAppOrigin(
        { hostname: "acme-web.pages.dev", port: "", protocol: "https:" },
        "web",
      ),
    ).toBe("https://acme-marketing.pages.dev");
  });

  it("returns null on apex prod (URLs baked at build)", () => {
    expect(
      resolveSiblingAppOrigin(
        { hostname: "www.example.com", port: "", protocol: "https:" },
        "marketing",
      ),
    ).toBeNull();
    expect(
      resolveSiblingAppOrigin(
        { hostname: "example.com", port: "", protocol: "https:" },
        "web",
      ),
    ).toBeNull();
  });
});

describe("resolveMarketingSiteOrigin", () => {
  it("resolves apex web to www marketing", () => {
    expect(
      resolveMarketingSiteOrigin({
        hostname: "example.com",
        port: "",
        protocol: "https:",
      }),
    ).toBe("https://www.example.com");
  });
});

describe("resolveProductSiteOrigin", () => {
  it("matches marketing sibling resolution", () => {
    expect(
      resolveProductSiteOrigin({
        hostname: "localhost",
        port: "3001",
        protocol: "http:",
      }),
    ).toBe("http://localhost:3000");
  });
});

describe("resolveApexMarketingOrigin", () => {
  it("returns www origin for bare apex hostname", () => {
    expect(
      resolveApexMarketingOrigin({
        hostname: "foobar.com",
        port: "",
        protocol: "https:",
      }),
    ).toBe("https://www.foobar.com");
  });
});
