/** Shared security headers for Cloudflare Pages `_headers`. */

export const WEB_CONTENT_SECURITY_POLICY =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.convex.site; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

const BASE_SECURITY_HEADERS = [
  "X-Content-Type-Options: nosniff",
  "X-Frame-Options: DENY",
  "Referrer-Policy: strict-origin-when-cross-origin",
] as const;

/**
 * Cloudflare Pages `_headers` body for the product web SPA.
 */
export function webPagesHeadersFile(): string {
  const lines = [
    "/*",
    ...BASE_SECURITY_HEADERS.map((h) => `  ${h}`),
    `  Content-Security-Policy: ${WEB_CONTENT_SECURITY_POLICY}`,
    "",
  ];
  return lines.join("\n");
}

/**
 * Cloudflare Pages `_headers` body for the marketing SSG site (no CSP).
 */
export function marketingPagesHeadersFile(): string {
  const lines = ["/*", ...BASE_SECURITY_HEADERS.map((h) => `  ${h}`), ""];
  return lines.join("\n");
}

/**
 * Cloudflare Pages `_redirects` SPA fallback for `adapter-static` + `200.html`.
 */
export function webSpaRedirectsFile(): string {
  return "/*    /200.html   200\n";
}

export { PAGES_STAGING_BRANCH } from "./hostnames";
