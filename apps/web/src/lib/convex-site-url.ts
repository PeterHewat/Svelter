/**
 * Converts a Convex cloud deployment URL to the HTTP actions (`.convex.site`) origin.
 *
 * @param convexCloudUrl - `PUBLIC_CONVEX_URL` value
 * @returns Site origin used for HTTP actions such as `/auth/anonymous`
 * @example
 * convexSiteUrl("https://happy-animal-123.convex.cloud");
 * // "https://happy-animal-123.convex.site"
 */
export function convexSiteUrl(convexCloudUrl: string): string {
  const url = new URL(convexCloudUrl);
  if (url.hostname.endsWith(".convex.cloud")) {
    url.hostname = url.hostname.replace(".convex.cloud", ".convex.site");
  }
  return url.origin;
}
