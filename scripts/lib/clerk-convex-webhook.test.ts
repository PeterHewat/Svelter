import { afterEach, describe, expect, it, mock } from "bun:test";
import {
  CLERK_CONVEX_WEBHOOK_PATH,
  ensureClerkSvixApp,
  isClerkSvixAppAlreadyExists,
} from "./clerk-convex-webhook";
import {
  clerkConvexWebhookUrl,
  clerkWebhookManualSteps,
  validateClerkWebhookSigningSecret,
} from "./sync-clerk-webhook";

describe("validateClerkWebhookSigningSecret", () => {
  it("accepts whsec_ values", () => {
    expect(
      validateClerkWebhookSigningSecret("whsec_test_secret_value"),
    ).toBeNull();
  });

  it("rejects Clerk and Google credential shapes", () => {
    expect(validateClerkWebhookSigningSecret("pk_test_abc")).toContain(
      "Clerk API key",
    );
    expect(
      validateClerkWebhookSigningSecret(
        "66350012067-m4j3ek3or7spfusfj7vep8odtcsivip8.apps.googleusercontent.com",
      ),
    ).toContain("Google OAuth");
    expect(validateClerkWebhookSigningSecret("GOCSPX-abcdef")).toContain(
      "Google OAuth",
    );
  });

  it("rejects empty or malformed values", () => {
    expect(validateClerkWebhookSigningSecret("")).not.toBeNull();
    expect(validateClerkWebhookSigningSecret("not-a-secret")).not.toBeNull();
  });
});

describe("clerkWebhookManualSteps", () => {
  it("points to Clerk webhooks with Development, Add Endpoint, and signing secret", () => {
    const url = clerkConvexWebhookUrl("https://happy-animal-123.convex.cloud");
    const steps = clerkWebhookManualSteps(url, "user.created, user.updated");
    expect(steps[0]).toContain("Development");
    expect(steps[1]).toContain("Add Endpoint");
    expect(steps[2]).toContain("Endpoint URL");
    expect(steps[2]).toContain(url);
    expect(steps[3]).toContain("user.created");
    expect(steps[4]).toContain("Signing secret");
  });
});

describe("clerkConvexWebhookUrl", () => {
  it("maps convex.cloud to convex.site webhook path", () => {
    expect(clerkConvexWebhookUrl("https://happy-animal-123.convex.cloud")).toBe(
      `https://happy-animal-123.convex.site${CLERK_CONVEX_WEBHOOK_PATH}`,
    );
  });
});

describe("ensureClerkSvixApp", () => {
  afterEach(() => {
    mock.restore();
  });

  it("returns ok when svix app already exists (409)", async () => {
    globalThis.fetch = mock(
      async () => new Response("already exists", { status: 409 }),
    ) as typeof fetch;

    await expect(ensureClerkSvixApp("sk_test_fixture")).resolves.toEqual({
      ok: true,
      alreadyExisted: true,
    });
  });

  it("returns ok when Clerk returns svix_app_exists", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(
          JSON.stringify({
            errors: [
              {
                message: "Only one Svix app is allowed per instance.",
                code: "svix_app_exists",
              },
            ],
          }),
          { status: 400 },
        ),
    ) as typeof fetch;

    await expect(ensureClerkSvixApp("sk_test_fixture")).resolves.toEqual({
      ok: true,
      alreadyExisted: true,
    });
  });
});

describe("isClerkSvixAppAlreadyExists", () => {
  it("detects svix_app_exists error code in JSON body", () => {
    const response = new Response(null, { status: 400 });
    expect(
      isClerkSvixAppAlreadyExists(
        response,
        JSON.stringify({ errors: [{ code: "svix_app_exists" }] }),
      ),
    ).toBe(true);
  });
});
