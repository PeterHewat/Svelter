import { describe, expect, it } from "bun:test";
import {
  frontendApiSlugFromPublishableKey,
  issuerFromPublishableKey,
  validateClerkDevelopmentPublishableKeyPaste,
  validateClerkDevelopmentSecretKeyPaste,
  validateClerkKeyPair,
  validateClerkProductionKeys,
  validateClerkProductionPublishableKeyPaste,
  validateClerkProductionSecretKeyPaste,
} from "./clerk-instance";
import {
  clerkDevPublishableKeyFixture,
  clerkDevSecretKeyFixture,
  clerkLivePublishableKeyFixture,
  clerkLiveSecretKeyFixture,
} from "./test-fixtures";

describe("issuerFromPublishableKey", () => {
  it("decodes the Frontend API host from a development publishable key", () => {
    const issuer = issuerFromPublishableKey(
      clerkDevPublishableKeyFixture(
        "anVzdC1idWxsZG9nLTEzLmNsZXJrLmFjY291bnRzLmRldiQ",
      ),
    );
    expect(issuer).toBe("https://just-bulldog-13.clerk.accounts.dev");
  });

  it("decodes production custom Frontend API from live publishable key", () => {
    expect(
      issuerFromPublishableKey(
        clerkLivePublishableKeyFixture("Y2xlcmsuZXh0cmFjdG9yYS5jb20k"),
      ),
    ).toBe("https://clerk.extractora.com");
  });

  it("returns null for invalid keys", () => {
    expect(issuerFromPublishableKey("not-a-key")).toBeNull();
  });
});

describe("validateClerkKeyPair", () => {
  it("rejects publishing the secret key as publishable key", () => {
    expect(
      validateClerkDevelopmentPublishableKeyPaste(
        clerkDevSecretKeyFixture("NDEcKcTmuFodeZ1hZtIfvoVYMQxExomKQHbJMQzF45"),
      ),
    ).toContain("secret key");
  });

  it("rejects publishing the publishable key as secret key", () => {
    expect(
      validateClerkDevelopmentSecretKeyPaste(
        clerkDevPublishableKeyFixture(
          "cG9saXRlLXNreWxhcmstNzUuY2xlcmsuYWNjb3VudHMuZGV2JA",
        ),
      ),
    ).toContain("publishable key");
  });

  it("rejects identical keys", () => {
    const key = clerkDevPublishableKeyFixture(
      "cG9saXRlLXNreWxhcmstNzUuY2xlcmsuYWNjb3VudHMuZGV2JA",
    );
    expect(validateClerkKeyPair(key, key)).not.toBeNull();
  });
});

describe("validateClerkProductionKeys", () => {
  const livePk = clerkLivePublishableKeyFixture("Y2xlcmsuZXh0cmFjdG9yYS5jb20k");
  const liveSk = clerkLiveSecretKeyFixture("NDEcKcTmuFodeZ1hZtIfvoVYMQxExom");

  it("accepts a valid production pair", () => {
    expect(validateClerkProductionKeys(livePk, liveSk)).toBeNull();
  });

  it("rejects development publishable keys", () => {
    expect(
      validateClerkProductionPublishableKeyPaste(
        clerkDevPublishableKeyFixture(
          "anVzdC1idWxsZG9nLTEzLmNsZXJrLmFjY291bnRzLmRldiQ",
        ),
      ),
    ).toContain("Production");
  });

  it("rejects development secret keys", () => {
    expect(
      validateClerkProductionSecretKeyPaste(
        clerkDevSecretKeyFixture("NDEcKcTmuFodeZ1hZtIfvoVYMQxExomKQHbJMQzF45"),
      ),
    ).toContain("Production");
  });

  it("rejects swapped production keys", () => {
    expect(validateClerkProductionKeys(liveSk, livePk)).not.toBeNull();
  });
});

describe("frontendApiSlugFromPublishableKey", () => {
  it("extracts the Frontend API slug", () => {
    expect(
      frontendApiSlugFromPublishableKey(
        clerkDevPublishableKeyFixture(
          "anVzdC1idWxsZG9nLTEzLmNsZXJrLmFjY291bnRzLmRldiQ",
        ),
      ),
    ).toBe("just-bulldog-13");
  });
});
