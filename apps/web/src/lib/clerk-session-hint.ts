const SESSION_COOKIE = /(?:^|;\s*)__session=([^;]+)/;
const UAT_COOKIE = /(?:^|;\s*)__client_uat=(\d+)/;

/**
 * Heuristic: Clerk session cookies indicate a returning signed-in user.
 * Ignores `__client_uat=0` (Clerk's signed-out sentinel set by dev handshake).
 *
 * @returns True when cookies suggest an active Clerk session
 */
export function mayHaveClerkSession(): boolean {
  if (typeof document === "undefined") return false;

  const cookies = document.cookie;
  const session = cookies.match(SESSION_COOKIE)?.[1]?.trim();
  if (session) return true;

  const uat = Number(cookies.match(UAT_COOKIE)?.[1] ?? 0);
  return uat > 0;
}
