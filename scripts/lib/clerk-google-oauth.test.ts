import { describe, expect, it } from "bun:test";
import {
  buildGoogleOAuthConfigPatch,
  buildGoogleOAuthEnablePatch,
  clerkGoogleManualSteps,
  clerkGoogleOAuthRedirectUri,
  googleOAuthJavaScriptOrigins,
} from "./clerk-google-oauth";

describe("clerkGoogleOAuthRedirectUri", () => {
  it("appends /v1/oauth_callback to the Clerk issuer", () => {
    expect(
      clerkGoogleOAuthRedirectUri("https://just-bulldog-13.clerk.accounts.dev"),
    ).toBe("https://just-bulldog-13.clerk.accounts.dev/v1/oauth_callback");
  });
});

describe("googleOAuthJavaScriptOrigins", () => {
  it("includes localhost, staging, and production pages.dev", () => {
    const origins = googleOAuthJavaScriptOrigins({
      productName: "My App",
      productTagLine: "Tag",
      github: null,
    });
    expect(origins).toContain("http://localhost");
    expect(origins).toContain("http://localhost:3000");
    expect(origins).toContain("https://staging.my-app-web.pages.dev");
    expect(origins).toContain("https://my-app-web.pages.dev");
  });

  it("includes apex web origin when configured", () => {
    const origins = googleOAuthJavaScriptOrigins({
      productName: "My App",
      productTagLine: "Tag",
      apexDomain: "example.com",
      github: null,
    });
    expect(origins).toContain("https://example.com");
  });
});

describe("buildGoogleOAuthConfigPatch", () => {
  it("enables Google with custom credentials", () => {
    expect(
      buildGoogleOAuthConfigPatch({
        clientId: "id.apps.googleusercontent.com",
        clientSecret: "secret",
      }),
    ).toEqual({
      connection_oauth_google: {
        enabled: true,
        client_id: "id.apps.googleusercontent.com",
        client_secret: "secret",
      },
    });
  });

  it("enables Google with a minimal patch", () => {
    expect(buildGoogleOAuthEnablePatch()).toEqual({
      connection_oauth_google: { enabled: true },
    });
  });
});

describe("clerkGoogleManualSteps", () => {
  it("includes Configure and SSO connections path", () => {
    const steps = clerkGoogleManualSteps();
    expect(steps[0]).toContain("Configure");
    expect(steps[0]).toContain("SSO connections");
    expect(steps.some((step) => step.includes("Use custom credentials"))).toBe(
      true,
    );
  });
});
