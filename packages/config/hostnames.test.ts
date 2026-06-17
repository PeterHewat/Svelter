import { describe, expect, test } from "vitest";
import {
  clerkDevelopmentOrigins,
  clerkProductionOrigins,
  deriveProductionHostnames,
  deriveStagingHostnames,
  pagesProductionHostname,
  pagesStagingHostname,
  PAGES_STAGING_BRANCH,
} from "./hostnames";

describe("deriveProductionHostnames", () => {
  test("derives apex and www production hostnames", () => {
    expect(deriveProductionHostnames("example.com")).toEqual({
      apex: "example.com",
      webProduction: "example.com",
      marketingProduction: "www.example.com",
      productionSiteUrls: ["https://example.com"],
    });
  });
});

describe("pagesStagingHostname", () => {
  test("builds staging branch alias hostname", () => {
    expect(pagesStagingHostname("my-app-web", PAGES_STAGING_BRANCH)).toBe(
      "staging.my-app-web.pages.dev",
    );
  });
});

describe("deriveStagingHostnames", () => {
  test("returns web and marketing staging hostnames", () => {
    expect(deriveStagingHostnames("svelter-web", "svelter-marketing")).toEqual({
      web: "staging.svelter-web.pages.dev",
      marketing: "staging.svelter-marketing.pages.dev",
    });
  });
});

describe("pagesProductionHostname", () => {
  test("builds production pages.dev hostname", () => {
    expect(pagesProductionHostname("svelter-web")).toBe(
      "svelter-web.pages.dev",
    );
  });
});

describe("clerkProductionOrigins", () => {
  test("includes pages.dev only without apex", () => {
    expect(clerkProductionOrigins("svelter-web")).toEqual([
      "https://svelter-web.pages.dev",
    ]);
  });

  test("includes pages.dev and apex with apex", () => {
    expect(clerkProductionOrigins("svelter-web", "example.com")).toEqual([
      "https://svelter-web.pages.dev",
      "https://example.com",
    ]);
  });
});

describe("clerkDevelopmentOrigins", () => {
  test("includes localhost and staging web origin", () => {
    expect(clerkDevelopmentOrigins("svelter-web")).toEqual([
      "http://localhost:5173",
      "https://staging.svelter-web.pages.dev",
    ]);
  });
});
