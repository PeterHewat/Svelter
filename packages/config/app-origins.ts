import {
  marketingDevOrigin,
  marketingPreviewOrigin,
  webDevOrigin,
  webPreviewOrigin,
} from "./dev-ports";
import {
  deriveProductionHostnames,
  pagesOrigin,
  pagesStagingHostname,
} from "./hostnames";

function trimOrigin(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Read a build-time origin from Node (`process.env`) or Vite (`import.meta.env`).
 *
 * Uses static property access so Vite can inline `PUBLIC_*` vars in client bundles.
 */
function readProductAppUrlFromEnv(): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    const fromProcess = trimOrigin(process.env.PUBLIC_PRODUCT_APP_URL);
    if (fromProcess) {
      return fromProcess;
    }
  }

  if (typeof import.meta !== "undefined" && import.meta.env) {
    return trimOrigin(import.meta.env.PUBLIC_PRODUCT_APP_URL);
  }

  return undefined;
}

/** @see readProductAppUrlFromEnv */
function readMarketingOriginFromEnv(): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    const fromProcess = trimOrigin(process.env.PUBLIC_MARKETING_ORIGIN);
    if (fromProcess) {
      return fromProcess;
    }
  }

  if (typeof import.meta !== "undefined" && import.meta.env) {
    return trimOrigin(import.meta.env.PUBLIC_MARKETING_ORIGIN);
  }

  return undefined;
}

/**
 * Product (web app) origin for marketing CTAs — resolved at marketing build time.
 *
 * Precedence: `PUBLIC_PRODUCT_APP_URL` → local dev default (`localhost:3000`).
 */
export function resolveProductAppOrigin(): string {
  return readProductAppUrlFromEnv() ?? webDevOrigin;
}

/**
 * Marketing site origin for canonical / hreflang URLs — resolved at marketing build time.
 *
 * Precedence: `PUBLIC_MARKETING_ORIGIN` → local dev default (`localhost:3001`).
 */
export function resolveMarketingOrigin(): string {
  return readMarketingOriginFromEnv() ?? marketingDevOrigin;
}

export type DeriveAppOriginsInput = {
  /** Cloudflare Pages project for `apps/web` (e.g. `my-app-web`). */
  webProject: string;
  /** Cloudflare Pages project for `apps/marketing` (e.g. `my-app-marketing`). */
  marketingProject: string;
  /** Preview branch label (e.g. `staging`); omit for production `*.pages.dev`. */
  stagingBranch?: string;
  /** Apex domain (e.g. `foobar.com`) — web on apex, marketing on `www`. */
  apexDomain?: string;
};

/**
 * Derive paired marketing ↔ product origins for CI builds.
 *
 * @param input - Pages project names, optional staging branch, optional apex
 * @returns Absolute `https://` origins for product and marketing
 * @example
 * deriveAppOrigins({ webProject: "acme-web", marketingProject: "acme-marketing", stagingBranch: "staging" });
 * // { product: "https://staging.acme-web.pages.dev", marketing: "https://staging.acme-marketing.pages.dev" }
 */
export function deriveAppOrigins(input: DeriveAppOriginsInput): {
  product: string;
  marketing: string;
} {
  const apex = input.apexDomain?.trim();
  if (apex && !input.stagingBranch) {
    const hostnames = deriveProductionHostnames(apex);
    return {
      product: `https://${hostnames.webProduction}`,
      marketing: `https://${hostnames.marketingProduction}`,
    };
  }

  if (input.stagingBranch) {
    const branch = input.stagingBranch;
    return {
      product: `https://${pagesStagingHostname(input.webProject, branch)}`,
      marketing: `https://${pagesStagingHostname(input.marketingProject, branch)}`,
    };
  }

  return {
    product: pagesOrigin(input.webProject),
    marketing: pagesOrigin(input.marketingProject),
  };
}

/** Local `vite preview` origins when building marketing for a local production smoke test. */
export const localPreviewAppOrigins = {
  product: webPreviewOrigin,
  marketing: marketingPreviewOrigin,
} as const;
