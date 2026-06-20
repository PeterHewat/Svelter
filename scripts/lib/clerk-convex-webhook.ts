/** HTTP path on the Convex `.convex.site` deployment for Clerk profile sync. */
export const CLERK_CONVEX_WEBHOOK_PATH = "/clerk-webhook";

/** Clerk webhook events synced into Convex `users` via `POST /clerk-webhook`. */
export const CLERK_USER_WEBHOOK_EVENTS = [
  "user.created",
  "user.updated",
  "user.deleted",
] as const;

export type EnsureClerkSvixAppResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Performs an authenticated Clerk Backend API request.
 *
 * @param secretKey - Clerk secret key (`sk_test_…` / `sk_live_…`)
 * @param path - Path under `/v1` (e.g. `/webhooks/svix`)
 * @param init - Optional fetch init
 */
async function clerkApiRequest(
  secretKey: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return fetch(`https://api.clerk.com/v1${normalizedPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

/**
 * Ensures the Clerk instance has an associated Svix application.
 *
 * Clerk's Backend API exposes only Svix app management (`POST /webhooks/svix`);
 * webhook endpoints are created in the Clerk Dashboard.
 *
 * @param secretKey - Clerk secret key
 */
export async function ensureClerkSvixApp(
  secretKey: string,
): Promise<EnsureClerkSvixAppResult> {
  const response = await clerkApiRequest(secretKey, "/webhooks/svix", {
    method: "POST",
  });
  if (response.ok) {
    return { ok: true };
  }

  const detail = (await response.text()).slice(0, 200);
  if (
    response.status === 409 ||
    /already exists|resource_exists|duplicate/i.test(detail)
  ) {
    return { ok: true };
  }

  return {
    ok: false,
    message: detail || `Clerk webhooks API returned ${response.status}`,
  };
}
