import { expect, test, vi } from "vitest";
import {
  clearAnonymousTokenCache,
  convexAuthModeFromClerk,
  resolveAnonymousConvexToken,
} from "./anonymous-auth";

test("convexAuthModeFromClerk returns guest when Clerk is loaded but signed out", () => {
  expect(
    convexAuthModeFromClerk({
      isLoaded: true,
      userId: null,
      hasSession: false,
    }),
  ).toBe("guest");
});

test("convexAuthModeFromClerk returns clerk when a session exists", () => {
  expect(
    convexAuthModeFromClerk({
      isLoaded: true,
      userId: "user_123",
      hasSession: true,
    }),
  ).toBe("clerk");
});

test("clearAnonymousTokenCache is safe to call repeatedly", () => {
  clearAnonymousTokenCache();
  clearAnonymousTokenCache();
});

test("resolveAnonymousConvexToken reuses cache on forceRefresh while still valid", async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        token: "jwt-token",
        userId: "anon_test",
        expiresIn: 3600,
      }),
    ),
  );
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("localStorage", {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  });

  clearAnonymousTokenCache();
  const siteUrl = "https://example.convex.site";

  await resolveAnonymousConvexToken(siteUrl, false);
  await resolveAnonymousConvexToken(siteUrl, true);

  expect(fetchMock).toHaveBeenCalledTimes(1);

  vi.unstubAllGlobals();
});
