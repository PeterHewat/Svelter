import { describe, expect, test } from "bun:test";
import { clerkIssuerDomainFromPublishableKey } from "./clerk-publishable-key";
import {
  clerkDevPublishableKeyFixture,
  clerkLivePublishableKeyFixture,
} from "./test-fixtures";

describe("clerkIssuerDomainFromPublishableKey", () => {
  test("decodes Clerk docs example", () => {
    expect(
      clerkIssuerDomainFromPublishableKey(
        clerkDevPublishableKeyFixture("ZXhhbXBsZS5hY2NvdW50cy5kZXYk"),
      ),
    ).toBe("https://example.accounts.dev");
  });

  test("decodes unpadded production-style key", () => {
    expect(
      clerkIssuerDomainFromPublishableKey(
        clerkLivePublishableKeyFixture(
          "ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ",
        ),
      ),
    ).toBe("https://fake-clerk-test.clerk.accounts.dev");
  });

  test("decodes production custom Frontend API host", () => {
    expect(
      clerkIssuerDomainFromPublishableKey(
        clerkLivePublishableKeyFixture("Y2xlcmsuZXh0cmFjdG9yYS5jb20k"),
      ),
    ).toBe("https://clerk.extractora.com");
  });

  test("returns null for invalid key", () => {
    expect(clerkIssuerDomainFromPublishableKey("not-a-key")).toBeNull();
  });
});
