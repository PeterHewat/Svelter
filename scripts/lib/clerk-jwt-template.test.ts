import { afterEach, describe, expect, it, mock } from "bun:test";
import {
  CLERK_CONVEX_JWT_CLAIMS,
  CLERK_CONVEX_JWT_TEMPLATE_NAME,
  ensureClerkConvexJwtTemplate,
  hasClerkConvexJwtTemplate,
} from "./clerk-jwt-template";

describe("hasClerkConvexJwtTemplate", () => {
  afterEach(() => {
    mock.restore();
  });

  it("returns true when convex template exists", async () => {
    globalThis.fetch = mock(async () =>
      Response.json({
        data: [{ name: "other" }, { name: CLERK_CONVEX_JWT_TEMPLATE_NAME }],
      }),
    ) as typeof fetch;

    await expect(hasClerkConvexJwtTemplate("sk_test_fixture")).resolves.toBe(
      true,
    );
  });
});

describe("ensureClerkConvexJwtTemplate", () => {
  afterEach(() => {
    mock.restore();
  });

  it("patches claims when convex template is missing picture", async () => {
    const fetchMock = mock(async (input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/jwt_templates") && init?.method === "PATCH") {
        return Response.json({ id: "jwt_1", claims: CLERK_CONVEX_JWT_CLAIMS });
      }
      if (url.includes("/jwt_templates")) {
        return Response.json({
          data: [
            {
              id: "jwt_1",
              name: CLERK_CONVEX_JWT_TEMPLATE_NAME,
              claims: { aud: "convex", name: "{{user.full_name}}" },
            },
          ],
        });
      }
      return new Response("not found", { status: 404 });
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await ensureClerkConvexJwtTemplate("sk_test_fixture");
    expect(result).toEqual({ ok: true, created: false, updated: true });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/jwt_templates/jwt_1"),
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("creates template when none exists", async () => {
    const fetchMock = mock(async (input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/jwt_templates") && init?.method === "POST") {
        return Response.json({ id: "jwt_new" });
      }
      if (url.includes("/jwt_templates")) {
        return Response.json({ data: [] });
      }
      return new Response("not found", { status: 404 });
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await ensureClerkConvexJwtTemplate("sk_test_fixture");
    expect(result).toEqual({ ok: true, created: true, updated: false });
  });
});
