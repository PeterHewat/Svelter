/** Shared security headers for Cloudflare Pages `_headers`. */

import { buildWebContentSecurityPolicy } from "./clerk-csp";

/** Default web CSP (staging/dev Clerk hosts via `*.clerk.accounts.dev` wildcards). */
export const WEB_CONTENT_SECURITY_POLICY = buildWebContentSecurityPolicy();

const BASE_SECURITY_HEADERS = [
  "X-Content-Type-Options: nosniff",
  "X-Frame-Options: DENY",
  "Referrer-Policy: strict-origin-when-cross-origin",
] as const;

/** Vite/SvelteKit content-hashed assets under `_app/immutable/`. */
export const IMMUTABLE_ASSET_CACHE_CONTROL =
  "Cache-Control: public, max-age=31536000, immutable";

/** Marketing `static/init.js` is not content-hashed; allow short CDN cache. */
export const MARKETING_INIT_CACHE_CONTROL =
  "Cache-Control: public, max-age=3600, must-revalidate";

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
    "/_app/immutable/*",
    `  ${IMMUTABLE_ASSET_CACHE_CONTROL}`,
    "",
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
  const lines = [
    "/_app/immutable/*",
    `  ${IMMUTABLE_ASSET_CACHE_CONTROL}`,
    "",
    "/init.js",
    `  ${MARKETING_INIT_CACHE_CONTROL}`,
    "",
    "/*",
    ...BASE_SECURITY_HEADERS.map((h) => `  ${h}`),
    "",
  ];
  return lines.join("\n");
}

export { PAGES_STAGING_BRANCH } from "./hostnames";
