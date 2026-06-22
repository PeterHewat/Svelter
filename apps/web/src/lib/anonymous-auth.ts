const ANON_USER_ID_KEY = "svelter_anon_user_id";

export type AnonymousTokenResponse = {
  token: string;
  userId: string;
  expiresIn: number;
};

let cachedToken: string | null = null;
let cachedExpiresAt = 0;
let inflightRequest: Promise<AnonymousTokenResponse> | null = null;

/** Buffer before JWT expiry when a cached token is still reused. */
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Reads the persisted guest user id from localStorage.
 */
export function readStoredAnonUserId(): string | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  return localStorage.getItem(ANON_USER_ID_KEY);
}

/**
 * Persists the guest user id for session refresh and account upgrade.
 */
export function storeAnonUserId(userId: string): void {
  localStorage.setItem(ANON_USER_ID_KEY, userId);
}

/**
 * Clears the guest user id after upgrading to a Clerk account.
 */
export function clearStoredAnonUserId(): void {
  localStorage.removeItem(ANON_USER_ID_KEY);
}

/**
 * Clears in-memory guest JWT cache (e.g. when switching to Clerk auth).
 */
export function clearAnonymousTokenCache(): void {
  cachedToken = null;
  cachedExpiresAt = 0;
  inflightRequest = null;
}

/**
 * Resolves a guest Convex JWT, reusing cache and deduplicating concurrent fetches.
 *
 * @param siteUrl - Convex `.convex.site` origin
 * @param forceRefresh - When true, bypass cache and fetch a new token
 */
export async function resolveAnonymousConvexToken(
  siteUrl: string,
  _forceRefresh: boolean,
): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && now < cachedExpiresAt - TOKEN_REFRESH_BUFFER_MS) {
    return cachedToken;
  }

  if (inflightRequest) {
    const payload = await inflightRequest;
    return payload.token;
  }

  inflightRequest = requestAnonymousToken(siteUrl, readStoredAnonUserId());
  try {
    const payload = await inflightRequest;
    cachedToken = payload.token;
    cachedExpiresAt = now + payload.expiresIn * 1000;
    return payload.token;
  } finally {
    inflightRequest = null;
  }
}

async function requestAnonymousToken(
  siteUrl: string,
  existingUserId: string | null,
  allowRetry = true,
): Promise<AnonymousTokenResponse> {
  const response = await fetch(`${siteUrl}/auth/anonymous`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(existingUserId ? { userId: existingUserId } : {}),
  });

  if (!response.ok) {
    if (allowRetry && existingUserId) {
      clearStoredAnonUserId();
      clearAnonymousTokenCache();
      return requestAnonymousToken(siteUrl, null, false);
    }
    throw new Error("Failed to start guest session");
  }

  const payload = (await response.json()) as AnonymousTokenResponse;
  storeAnonUserId(payload.userId);
  return payload;
}

export type ConvexAuthMode = "idle" | "guest" | "clerk";

/**
 * Maps Clerk load state to the Convex auth mode we should configure.
 *
 * Avoids `guest` while Clerk session cookies indicate a returning or in-flight
 * sign-in (e.g. Google One Tap redirect) so we do not race anonymous auth
 * against `session.getToken({ template: "convex" })`.
 */
export function convexAuthModeFromClerk(input: {
  isLoaded: boolean;
  userId: string | null | undefined;
  hasSession: boolean;
  /** Clerk session cookies or OAuth return — Clerk may still be hydrating. */
  clerkSessionHydrating?: boolean;
}): ConvexAuthMode {
  if (!input.isLoaded) {
    return "idle";
  }
  if (input.userId) {
    return "clerk";
  }
  if (input.clerkSessionHydrating) {
    return "idle";
  }
  return "guest";
}
