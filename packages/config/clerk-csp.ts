/** Clerk-related CSP source expressions (see Clerk CSP docs). */

const CLERK_SCRIPT_SRC = [
  "https://*.clerk.accounts.dev",
  "https://challenges.cloudflare.com",
] as const;

const CLERK_CONNECT_SRC = [
  "https://*.clerk.accounts.dev",
  "https://clerk-telemetry.com",
  "https://*.clerk-telemetry.com",
] as const;

const CLERK_FRAME_SRC = [
  "https://challenges.cloudflare.com",
  "https://*.clerk.accounts.dev",
] as const;

const CLERK_IMG_SRC = ["https://img.clerk.com"] as const;

/** Google Identity Services (One Tap / Sign in with Google). */
const GOOGLE_IDENTITY_SCRIPT_SRC = [
  "https://accounts.google.com/gsi/client",
] as const;
const GOOGLE_IDENTITY_PARENT_SRC = [
  "https://accounts.google.com/gsi/",
] as const;
const GOOGLE_IDENTITY_STYLE_SRC = [
  "https://accounts.google.com/gsi/style",
] as const;

function isPlausibleHostname(hostname: string): boolean {
  return /^[a-zA-Z0-9.-]+$/.test(hostname) && hostname.includes(".");
}

/**
 * Derives the Clerk Frontend API origin (`https://…`) from a publishable key.
 *
 * @param publishableKey - `pk_test_…` or `pk_live_…`
 */
export function clerkFapiOriginFromPublishableKey(
  publishableKey: string,
): string | null {
  const match = publishableKey.trim().match(/^pk_(?:test|live)_(.+)$/);
  if (!match) return null;

  let encoded = match[1];
  const padding = encoded.length % 4;
  if (padding > 0) {
    encoded += "=".repeat(4 - padding);
  }

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const hostname = decoded.replace(/\$$/, "").trim();
    if (!isPlausibleHostname(hostname)) return null;
    return `https://${hostname}`;
  } catch {
    return null;
  }
}

/**
 * Builds the web SPA Content-Security-Policy string.
 *
 * @param options.clerkFapiOrigin - Clerk Frontend API origin from the build-time publishable key (production custom domains)
 */
export function buildWebContentSecurityPolicy(options?: {
  clerkFapiOrigin?: string | null;
}): string {
  const clerkFapiOrigin = options?.clerkFapiOrigin?.trim() || null;

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...CLERK_SCRIPT_SRC,
    ...GOOGLE_IDENTITY_SCRIPT_SRC,
  ];
  const connectSrc = [
    "'self'",
    "https://*.convex.cloud",
    "wss://*.convex.cloud",
    "https://*.convex.site",
    ...CLERK_CONNECT_SRC,
    ...GOOGLE_IDENTITY_PARENT_SRC,
  ];
  const frameSrc = [
    "'self'",
    ...CLERK_FRAME_SRC,
    ...GOOGLE_IDENTITY_PARENT_SRC,
  ];

  if (clerkFapiOrigin && !clerkFapiOrigin.includes(".clerk.accounts.")) {
    scriptSrc.push(clerkFapiOrigin);
    connectSrc.push(clerkFapiOrigin);
    frameSrc.push(clerkFapiOrigin);
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    `style-src 'self' 'unsafe-inline' ${GOOGLE_IDENTITY_STYLE_SRC.join(" ")}`,
    `img-src 'self' data: https: ${CLERK_IMG_SRC.join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "worker-src 'self' blob:",
    `frame-src ${frameSrc.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
