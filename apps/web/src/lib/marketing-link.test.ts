import { afterEach, describe, expect, it, vi } from "vitest";
import { marketingHomeHref, marketingSiteHref } from "./marketing-link";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("marketingSiteHref", () => {
  it("resolves marketing origin from the current web app port", () => {
    vi.stubGlobal("window", {
      location: {
        hostname: "localhost",
        port: "3000",
        protocol: "http:",
      },
      matchMedia: () => ({ matches: false }),
    });

    expect(marketingSiteHref()).toBe("http://localhost:3001/?theme=light");
    expect(marketingSiteHref("en")).toBe(
      "http://localhost:3001/en?theme=light",
    );
    expect(marketingHomeHref("fr", { theme: "dark" })).toBe(
      "http://localhost:3001/fr?theme=dark",
    );
  });

  it("resolves pages.dev sibling hostnames", () => {
    vi.stubGlobal("window", {
      location: {
        hostname: "staging.acme-web.pages.dev",
        port: "",
        protocol: "https:",
      },
      matchMedia: () => ({ matches: false }),
    });

    expect(marketingSiteHref("en")).toBe(
      "https://staging.acme-marketing.pages.dev/en?theme=light",
    );
  });

  it("resolves apex web to www marketing", () => {
    vi.stubGlobal("window", {
      location: {
        hostname: "example.com",
        port: "",
        protocol: "https:",
      },
      matchMedia: () => ({ matches: false }),
    });

    expect(marketingSiteHref("en")).toBe(
      "https://www.example.com/en?theme=light",
    );
  });
});
