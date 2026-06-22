/** Routes and query params that require the deferred Clerk shell. */
const CLERK_ROUTES = ["/tasks", "/user", "/login"] as const;

/**
 * @returns True when the URL includes `?auth=login`
 */
export function hasAuthLoginParam(searchParams: URLSearchParams): boolean {
  return searchParams.get("auth") === "login";
}

/**
 * Removes `auth=login` from a query string.
 *
 * @returns True when the param was removed
 */
export function stripAuthLoginFromSearchParams(
  searchParams: URLSearchParams,
): boolean {
  if (!hasAuthLoginParam(searchParams)) return false;
  searchParams.delete("auth");
  return true;
}

/**
 * Same-page URL without the `auth=login` query param.
 *
 * @param url - Current page URL
 * @returns Clean path when `auth=login` was present, else `null`
 */
export function urlWithoutAuthLoginParam(url: URL): string | null {
  const params = new URLSearchParams(url.search);
  if (!stripAuthLoginFromSearchParams(params)) return null;
  const search = params.toString();
  return `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
}

/**
 * Whether the current route should load Clerk before rendering page content.
 *
 * @param pathname - Current path (e.g. `/tasks`)
 * @param searchParams - Current query string
 */
export function needsClerkForRoute(
  pathname: string,
  searchParams: URLSearchParams,
): boolean {
  return (
    (CLERK_ROUTES as readonly string[]).includes(pathname) ||
    hasAuthLoginParam(searchParams)
  );
}
