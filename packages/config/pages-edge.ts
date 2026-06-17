/** Shared security headers for Cloudflare Pages `_headers`. */

import { buildWebContentSecurityPolicy } from "./clerk-csp";

/** Default web CSP (staging/dev Clerk hosts via `*.clerk.accounts.dev` wildcards). */
export const WEB_CONTENT_SECURITY_POLICY = buildWebContentSecurityPolicy();

const BASE_SECURITY_HEADERS = [
  "X-Content-Type-Options: nosniff",
  "X-Frame-Options: DENY",
  "Referrer-Policy: strict-origin-when-cross-origin",
] as const;

/**
 * Cloudflare Pages `_headers` body for the product web SPA.
 *
 * @param options.clerkFapiOrigin - Clerk Frontend API origin for production custom domains
 */
export function webPagesHeadersFile(options?: {
  clerkFapiOrigin?: string | null;
}): string {
  const csp =
    options?.clerkFapiOrigin != null
      ? buildWebContentSecurityPolicy({
          clerkFapiOrigin: options.clerkFapiOrigin,
        })
      : WEB_CONTENT_SECURITY_POLICY;
  const lines = [
    "/*",
    ...BASE_SECURITY_HEADERS.map((h) => `  ${h}`),
    `  Content-Security-Policy: ${csp}`,
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

export { PAGES_STAGING_BRANCH } from "./hostnames";
