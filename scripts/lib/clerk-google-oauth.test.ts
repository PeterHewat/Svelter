import { describe, expect, it } from "bun:test";
import {
  buildGoogleOAuthConfigPatch,
  buildGoogleOAuthEnablePatch,
  clerkDeployGoogleOAuthManualSteps,
  clerkGoogleManualSteps,
  clerkGoogleOAuthRedirectUri,
  clerkProductionGoogleOAuthRedirectUri,
  googleOAuthDevelopmentJavaScriptOrigins,
  googleOAuthProductionJavaScriptOrigins,
} from "./clerk-google-oauth";

describe("clerkGoogleOAuthRedirectUri", () => {
  it("appends /v1/oauth_callback to the Clerk issuer", () => {
    expect(
      clerkGoogleOAuthRedirectUri("https://just-bulldog-13.clerk.accounts.dev"),
    ).toBe("https://just-bulldog-13.clerk.accounts.dev/v1/oauth_callback");
  });
});

describe("googleOAuthDevelopmentJavaScriptOrigins", () => {
  it("includes localhost, staging, and production pages.dev", () => {
    const origins = googleOAuthDevelopmentJavaScriptOrigins({
      productName: "My App",
      productTagLine: "Tag",
      github: null,
    });
    expect(origins).toContain("http://localhost");
    expect(origins).toContain("http://localhost:3000");
    expect(origins).toContain("https://staging.my-app-web.pages.dev");
    expect(origins).toContain("https://my-app-web.pages.dev");
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

describe("clerkProductionGoogleOAuthRedirectUri", () => {
  it("uses accounts subdomain on the apex", () => {
    expect(clerkProductionGoogleOAuthRedirectUri("example.com")).toBe(
      "https://accounts.example.com/v1/oauth_callback",
    );
  });
});

describe("clerkDeployGoogleOAuthManualSteps", () => {
  it("includes Google Cloud and Clerk dashboard links", () => {
    const steps = clerkDeployGoogleOAuthManualSteps("example.com");
    const joined = steps.join("\n");
    expect(joined).toContain("console.cloud.google.com");
    expect(joined).toContain("https://example.com");
    expect(joined).toContain("https://www.example.com");
    expect(joined).toContain("accounts.example.com/v1/oauth_callback");
    expect(joined).toContain("clerk.com/docs");
    expect(joined).toContain("clerk.com/docs");
  });
});

describe("googleOAuthProductionJavaScriptOrigins", () => {
  it("includes apex and www", () => {
    expect(googleOAuthProductionJavaScriptOrigins("example.com")).toEqual([
      "https://example.com",
      "https://www.example.com",
    ]);
  });
});

describe("clerkGoogleManualSteps", () => {
  it("includes linked Clerk and Google Cloud paths", () => {
    const steps = clerkGoogleManualSteps("development");
    expect(steps[0]).toContain("**Development**");
    expect(
      steps.some((step) => step.includes("console.cloud.google.com")),
    ).toBe(true);
    expect(steps.some((step) => step.includes("Use custom credentials"))).toBe(
      true,
    );
  });
});
