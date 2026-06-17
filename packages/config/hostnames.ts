import { normalizeApexDomainInput } from "./validate-domain";

/** Wrangler `--branch` label for staging preview deployments. */
export const PAGES_STAGING_BRANCH = "staging";

export type ProductionHostnames = {
  apex: string;
  webProduction: string;
  marketingProduction: string;
  productionSiteUrls: string[];
};

export type StagingHostnames = {
  web: string;
  marketing: string;
};

/**
 * Production custom domains from an apex domain.
 *
 * @param apexDomain - Apex domain (e.g. `example.com`)
 */
export function deriveProductionHostnames(
  apexDomain: string,
): ProductionHostnames {
  const apex = normalizeApexDomainInput(apexDomain);
  return {
    apex,
    webProduction: apex,
    marketingProduction: `www.${apex}`,
    productionSiteUrls: [`https://${apex}`],
  };
}

/**
 * Cloudflare Pages branch-alias hostname (no scheme).
 *
 * @param projectName - Pages project name (e.g. `my-app-web`)
 * @param branch - Preview branch label (default `staging`)
 */
export function pagesStagingHostname(
  projectName: string,
  branch: string = PAGES_STAGING_BRANCH,
): string {
  return `${branch}.${projectName}.pages.dev`;
}

/**
 * Staging hostnames for web and marketing Pages projects.
 *
 * @param webProject - Web Pages project name
 * @param marketingProject - Marketing Pages project name
 */
export function deriveStagingHostnames(
  webProject: string,
  marketingProject: string,
): StagingHostnames {
  return {
    web: pagesStagingHostname(webProject),
    marketing: pagesStagingHostname(marketingProject),
  };
}

/**
 * Default Cloudflare Pages production hostname (no scheme).
 *
 * @param projectName - Pages project name (e.g. `my-app-web`)
 */
export function pagesProductionHostname(projectName: string): string {
  return `${projectName}.pages.dev`;
}

/**
 * Clerk Production `allowed_origins` for `*.pages.dev` and optional apex web domain.
 *
 * @param webProject - Web Pages project name
 * @param apexDomain - Optional apex for custom production domain
 */
export function clerkProductionOrigins(
  webProject: string,
  apexDomain?: string,
): string[] {
  const origins = [`https://${pagesProductionHostname(webProject)}`];
  if (apexDomain?.trim()) {
    const { webProduction } = deriveProductionHostnames(apexDomain);
    origins.push(`https://${webProduction}`);
  }
  return origins;
}

/**
 * Clerk Development `allowed_origins` for local dev and deployed staging web.
 *
 * @param webProject - Web Pages project name
 */
export function clerkDevelopmentOrigins(webProject: string): string[] {
  return [
    "http://localhost:5173",
    `https://${pagesStagingHostname(webProject)}`,
  ];
}
