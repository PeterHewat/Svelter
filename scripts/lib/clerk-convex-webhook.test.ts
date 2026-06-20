import { afterEach, describe, expect, it, mock } from "bun:test";
import {
  CLERK_CONVEX_WEBHOOK_PATH,
  ensureClerkSvixApp,
} from "./clerk-convex-webhook";
import { clerkConvexWebhookUrl } from "./sync-clerk-webhook";

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

  it("returns ok when svix app already exists", async () => {
    globalThis.fetch = mock(
      async () => new Response("already exists", { status: 409 }),
    ) as typeof fetch;

    await expect(ensureClerkSvixApp("sk_test_fixture")).resolves.toEqual({
      ok: true,
    });
  });
});
