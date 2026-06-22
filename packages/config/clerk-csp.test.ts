import { describe, expect, test } from "vitest";
import {
  buildWebContentSecurityPolicy,
  clerkFapiOriginFromPublishableKey,
} from "./clerk-csp";

describe("clerkFapiOriginFromPublishableKey", () => {
  test("decodes development Clerk host", () => {
    expect(
      clerkFapiOriginFromPublishableKey(
        "pk_live_ZmFrZS1jbGVyay10ZXN0LmNsZXJrLmFjY291bnRzLmRldiQ",
      ),
    ).toBe("https://fake-clerk-test.clerk.accounts.dev");
  });

  test("returns null for invalid key", () => {
    expect(clerkFapiOriginFromPublishableKey("not-a-key")).toBeNull();
    expect(clerkFapiOriginFromPublishableKey("pk_test_dummy")).toBeNull();
  });
});

describe("buildWebContentSecurityPolicy", () => {
  test("allows Clerk development script and connect hosts", () => {
    const csp = buildWebContentSecurityPolicy();
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("https://*.clerk.accounts.dev");
    expect(csp).toContain("https://challenges.cloudflare.com");
    expect(csp).toContain("https://clerk-telemetry.com");
    expect(csp).toContain("worker-src 'self' blob:");
    expect(csp).toContain("https://img.clerk.com");
    expect(csp).toContain("https://accounts.google.com/gsi/client");
    expect(csp).toContain("https://accounts.google.com/gsi/");
    expect(csp).toContain("https://accounts.google.com/gsi/style");
  });

  test("adds production custom Clerk domain when not on accounts.dev", () => {
    const csp = buildWebContentSecurityPolicy({
      clerkFapiOrigin: "https://clerk.example.com",
    });
    expect(csp).toContain("https://clerk.example.com");
  });

  test("does not duplicate accounts.dev origin from publishable key", () => {
    const csp = buildWebContentSecurityPolicy({
      clerkFapiOrigin: "https://fake-clerk-test.clerk.accounts.dev",
    });
    const matches = csp.match(/fake-clerk-test\.clerk\.accounts\.dev/g);
    expect(matches).toBeNull();
  });
});
