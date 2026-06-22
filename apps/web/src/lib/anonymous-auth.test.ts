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

test("convexAuthModeFromClerk returns idle when session cookies suggest Clerk is hydrating", () => {
  expect(
    convexAuthModeFromClerk({
      isLoaded: true,
      userId: null,
      hasSession: true,
      clerkSessionHydrating: true,
    }),
  ).toBe("idle");
});

test("convexAuthModeFromClerk returns guest when stale uat would not block sign-out", () => {
  expect(
    convexAuthModeFromClerk({
      isLoaded: true,
      userId: null,
      hasSession: false,
      clerkSessionHydrating: false,
    }),
  ).toBe("guest");
});

test("convexAuthModeFromClerk returns clerk when userId is set before session object", () => {
  expect(
    convexAuthModeFromClerk({
      isLoaded: true,
      userId: "user_123",
      hasSession: false,
    }),
  ).toBe("clerk");
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

test("requestAnonymousToken retries without stored userId after failure", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(new Response(null, { status: 400 }))
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          token: "jwt-token",
          userId: "anon_new",
          expiresIn: 3600,
        }),
      ),
    );
  vi.stubGlobal("fetch", fetchMock);
  const removeItem = vi.fn();
  vi.stubGlobal("localStorage", {
    getItem: () => "anon_stale",
    setItem: () => {},
    removeItem,
  });

  clearAnonymousTokenCache();
  const token = await resolveAnonymousConvexToken(
    "https://example.convex.site",
    false,
  );

  expect(token).toBe("jwt-token");
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[1]?.[1]?.body).toBe("{}");
  expect(removeItem).toHaveBeenCalled();

  vi.unstubAllGlobals();
});
