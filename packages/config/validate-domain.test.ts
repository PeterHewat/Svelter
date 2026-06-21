import { describe, expect, it } from "vitest";
import {
  bakedApexMarketingOrigin,
  bakedApexProductOrigin,
  hasApexDomain,
  isValidApexDomain,
  normalizeApexDomainInput,
} from "./validate-domain";

describe("normalizeApexDomainInput", () => {
  it("strips scheme and trailing dot", () => {
    expect(normalizeApexDomainInput("https://Example.com.")).toBe(
      "example.com",
    );
  });
});

describe("isValidApexDomain", () => {
  it("accepts apex domains", () => {
    expect(isValidApexDomain("example.com")).toBe(true);
    expect(isValidApexDomain("my-product.io")).toBe(true);
  });

  it("rejects invalid values", () => {
    expect(isValidApexDomain("")).toBe(false);
    expect(isValidApexDomain("example")).toBe(false);
    expect(isValidApexDomain("www.example.com")).toBe(false);
    expect(isValidApexDomain("localhost")).toBe(false);
    expect(isValidApexDomain("https://example.com")).toBe(false);
  });
});

describe("hasApexDomain", () => {
  it("returns true for a valid apex", () => {
    expect(hasApexDomain("example.com")).toBe(true);
  });

  it("returns false when missing or invalid", () => {
    expect(hasApexDomain()).toBe(false);
    expect(hasApexDomain("")).toBe(false);
    expect(hasApexDomain("www.example.com")).toBe(false);
  });
});

describe("baked apex origins", () => {
  it("derives product and marketing origins from APEX_DOMAIN", () => {
    expect(bakedApexProductOrigin("foobar.com")).toBe("https://foobar.com");
    expect(bakedApexMarketingOrigin("foobar.com")).toBe(
      "https://www.foobar.com",
    );
  });

  it("returns null without apex", () => {
    expect(bakedApexProductOrigin(undefined)).toBeNull();
    expect(bakedApexMarketingOrigin("")).toBeNull();
  });
});
