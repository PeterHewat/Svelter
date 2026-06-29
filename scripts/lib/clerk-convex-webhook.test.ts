import { afterEach, describe, expect, it, mock } from "bun:test";
import {
  CLERK_CONVEX_WEBHOOK_PATH,
  ensureClerkSvixApp,
  isClerkSvixAppAlreadyExists,
} from "./clerk-convex-webhook";
import {
  clerkConvexWebhookUrl,
  clerkWebhookManualSteps,
} from "./sync-clerk-webhook";

describe("clerkWebhookManualSteps", () => {
  it("points to Clerk webhooks with Development, Add endpoint, and signing secret", () => {
    const url = clerkConvexWebhookUrl("https://happy-animal-123.convex.cloud");
    const steps = clerkWebhookManualSteps(url, "user.created, user.updated");
    expect(steps[0]).toContain("Development");
    expect(steps[1]).toContain("Add endpoint");
    expect(steps[1]).toContain(url);
    expect(steps[2]).toContain("user.created");
    expect(steps[3]).toContain("Signing secret");
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
