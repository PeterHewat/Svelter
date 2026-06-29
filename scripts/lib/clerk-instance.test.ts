import { describe, expect, it } from "bun:test";
import {
  frontendApiSlugFromPublishableKey,
  issuerFromPublishableKey,
} from "./clerk-instance";

describe("issuerFromPublishableKey", () => {
  it("decodes the Frontend API host from a development publishable key", () => {
    const issuer = issuerFromPublishableKey(
      "pk_test_anVzdC1idWxsZG9nLTEzLmNsZXJrLmFjY291bnRzLmRldiQ",
    );
    expect(issuer).toBe("https://just-bulldog-13.clerk.accounts.dev");
  });

  it("decodes production custom Frontend API from pk_live", () => {
    expect(
      issuerFromPublishableKey("pk_live_Y2xlcmsuZXh0cmFjdG9yYS5jb20k"),
    ).toBe("https://clerk.extractora.com");
  });

  it("returns null for invalid keys", () => {
    expect(issuerFromPublishableKey("not-a-key")).toBeNull();
  });
});

describe("frontendApiSlugFromPublishableKey", () => {
  it("extracts the Frontend API slug", () => {
    expect(
      frontendApiSlugFromPublishableKey(
        "pk_test_anVzdC1idWxsZG9nLTEzLmNsZXJrLmFjY291bnRzLmRldiQ",
      ),
    ).toBe("just-bulldog-13");
  });
});
