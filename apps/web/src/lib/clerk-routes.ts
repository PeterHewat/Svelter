/** Routes and query params that require the deferred Clerk shell. */
const CLERK_ROUTES = ["/tasks", "/login"] as const;

/**
 * @returns True when the URL includes `?auth=login`
 */
export function hasAuthLoginParam(searchParams: URLSearchParams): boolean {
  return searchParams.get("auth") === "login";
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
