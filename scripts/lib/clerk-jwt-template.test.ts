import { afterEach, describe, expect, it, mock } from "bun:test";
import {
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

  it("skips create when template already exists", async () => {
    const fetchMock = mock(async () =>
      Response.json({
        data: [{ name: CLERK_CONVEX_JWT_TEMPLATE_NAME }],
      }),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await ensureClerkConvexJwtTemplate("sk_test_fixture");
    expect(result).toEqual({ ok: true, created: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
