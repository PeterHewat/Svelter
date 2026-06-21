/** Which SvelteKit app is resolving a cross-link. */
export type CrossAppSite = "web" | "marketing";

/** Minimal location shape for cross-app origin resolution (browser or tests). */
export type CrossAppLocation = {
  hostname: string;
  port: string;
  protocol: string;
};

function siblingPortOrigin(
  location: CrossAppLocation,
  site: CrossAppSite,
): string {
  const currentPort = Number.parseInt(location.port, 10);
  const delta = site === "web" ? 1 : -1;
  const siblingPort = currentPort + delta;
  return `${location.protocol}//${location.hostname}:${siblingPort}`;
}

function pagesDevSiblingOrigin(
  location: CrossAppLocation,
  site: CrossAppSite,
): string | null {
  if (!location.hostname.endsWith(".pages.dev")) {
    return null;
  }

  const { hostname, protocol } = location;
  if (site === "marketing") {
    if (!hostname.includes("-marketing.")) {
      return null;
    }
    return `${protocol}//${hostname.replace("-marketing.", "-web.")}`;
  }

  if (!hostname.includes("-web.")) {
    return null;
  }
  return `${protocol}//${hostname.replace("-web.", "-marketing.")}`;
}

/**
 * Resolve the sibling app origin from the current URL.
 *
 * Rules (in order):
 * 1. Explicit non-default port → sibling port ±1 (web +1, marketing −1).
 * 2. `*.pages.dev` → swap `-web` / `-marketing` in the hostname.
 * 3. Otherwise → `null` (apex marketing CTAs are baked at build time).
 *
 * @param location - Current page location
 * @param site - App that is resolving the link
 * @returns Sibling origin, or `null` when the caller should use a baked URL
 */
export function resolveSiblingAppOrigin(
  location: CrossAppLocation,
  site: CrossAppSite,
): string | null {
  const { port } = location;
  if (port !== "" && port !== "443" && port !== "80") {
    return siblingPortOrigin(location, site);
  }

  return pagesDevSiblingOrigin(location, site);
}

/**
 * Marketing origin when the web app runs on a production apex domain (no `www`).
 *
 * @param location - Current web app location
 */
export function resolveApexMarketingOrigin(
  location: CrossAppLocation,
): string | null {
  if (
    location.hostname === "localhost" ||
    location.hostname.endsWith(".pages.dev") ||
    location.port !== ""
  ) {
    return null;
  }

  if (location.hostname.startsWith("www.")) {
    return null;
  }

  return `${location.protocol}//www.${location.hostname}`;
}

/**
 * Marketing site origin for links from the product web app.
 *
 * @param location - Current web app location
 */
export function resolveMarketingSiteOrigin(location: CrossAppLocation): string {
  return (
    resolveSiblingAppOrigin(location, "web") ??
    resolveApexMarketingOrigin(location) ??
    "http://localhost:3001"
  );
}

/**
 * Product app origin for links from the marketing site (runtime only).
 *
 * @param location - Current marketing site location
 */
export function resolveProductSiteOrigin(
  location: CrossAppLocation,
): string | null {
  return resolveSiblingAppOrigin(location, "marketing");
}
