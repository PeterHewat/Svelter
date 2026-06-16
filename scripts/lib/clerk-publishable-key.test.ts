import { describe, expect, test } from "bun:test";
import { clerkIssuerDomainFromPublishableKey } from "./clerk-publishable-key";

describe("clerkIssuerDomainFromPublishableKey", () => {
  test("decodes Clerk docs example", () => {
    expect(
      clerkIssuerDomainFromPublishableKey(
        "pk_test_ZXhhbXBsZS5hY2NvdW50cy5kZXYk",
      ),
    ).toBe("https://example.accounts.dev");
  });

  test("decodes unpadded production-style key", () => {
    expect(
      clerkIssuerDomainFromPublishableKey(
        "pk_live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ",
      ),
    ).toBe("https://fake-clerk-test.clerk.accounts.dev");
  });

  test("returns null for invalid key", () => {
    expect(clerkIssuerDomainFromPublishableKey("not-a-key")).toBeNull();
  });
});
