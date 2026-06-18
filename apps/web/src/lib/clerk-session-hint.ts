const SESSION_COOKIE = /(?:^|;\s*)__session(?:_[^=;]+)?=([^;]+)/;
const UAT_COOKIE = /(?:^|;\s*)__client_uat(?:_[^=;]+)?=(\d+)/;

const CLERK_LOAD_REQUESTED_KEY = "svelter:clerk-load-requested";

/**
 * Heuristic: Clerk session cookies indicate a returning signed-in user.
 * Ignores `__client_uat=0` (Clerk's signed-out sentinel set by dev handshake).
 * Matches suffixed cookie names (e.g. `__client_uat_<hash>`).
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

/**
 * Clerk OAuth / handshake redirects often include `__clerk` in the query or hash.
 *
 * @returns True when the current URL looks like a Clerk auth return
 */
export function hasClerkReturnSignal(): boolean {
  if (typeof window === "undefined") return false;
  const { search, hash } = window.location;
  return search.includes("__clerk") || hash.includes("__clerk");
}

/**
 * @returns True when this tab already started loading the deferred Clerk shell
 */
export function wasClerkLoadRequested(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(CLERK_LOAD_REQUESTED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Remember that this tab should keep the Clerk shell loaded (survives OAuth redirects).
 */
export function markClerkLoadRequested(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(CLERK_LOAD_REQUESTED_KEY, "1");
  } catch {
    // private browsing / disabled storage
  }
}

/**
 * Whether the deferred Clerk shell should load without visiting `/tasks` or `/login`.
 *
 * @returns True when cookies, session storage, or the URL indicate Clerk is needed
 */
export function shouldEagerLoadClerk(): boolean {
  return (
    mayHaveClerkSession() || wasClerkLoadRequested() || hasClerkReturnSignal()
  );
}
