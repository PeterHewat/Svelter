import type { GitHubRepo } from "./repo-identity";

export const CONVEX_DASHBOARD = "https://dashboard.convex.dev";
export const CLERK_DASHBOARD = "https://dashboard.clerk.com";
export const CLERK_SIGN_UP = "https://dashboard.clerk.com/sign-up";
export const CLERK_CREATE_APP = "https://dashboard.clerk.com/apps";
export const CLERK_NEW_APP = "https://dashboard.clerk.com/apps/new";
export const CLERK_CONVEX_SETUP =
  "https://dashboard.clerk.com/apps/setup/convex";
export const CLERK_API_KEYS =
  "https://dashboard.clerk.com/last-active?path=api-keys";
export const CLERK_JWT_TEMPLATES =
  "https://dashboard.clerk.com/last-active?path=jwt-templates";
export const CLERK_WEBHOOKS =
  "https://dashboard.clerk.com/last-active?path=webhooks";

/**
 * Clerk application dashboard URL when an app id is known.
 *
 * @param appId - Clerk application ID (`app_…`)
 */
export function clerkAppDashboardUrl(appId: string): string {
  return `https://dashboard.clerk.com/apps/${appId}`;
}
export const CLOUDFLARE_DASHBOARD = "https://dash.cloudflare.com";
export const CLOUDFLARE_SIGN_UP = "https://dash.cloudflare.com/sign-up";
export const CLOUDFLARE_API_TOKENS =
  "https://dash.cloudflare.com/profile/api-tokens";

/**
 * Cloudflare Pages project dashboard URL.
 *
 * @param accountId - Cloudflare account ID
 * @param projectName - Pages project name
 */
export function cloudflarePagesProjectUrl(
  accountId: string,
  projectName: string,
): string {
  return `https://dash.cloudflare.com/${accountId}/pages/view/${projectName}`;
}

/**
 * Cloudflare DNS settings URL for a zone.
 *
 * @param apex - Apex domain
 */
export function cloudflareZoneDnsUrl(apex: string): string {
  return `https://dash.cloudflare.com/?to=/:account/${apex}/dns`;
}

/**
 * GitHub Actions secrets settings URL for a repository.
 *
 * @param github - Parsed GitHub repository
 */
export function githubSecretsUrl(github: GitHubRepo): string {
  return `https://github.com/${github.org}/${github.repo}/settings/secrets/actions`;
}

/**
 * GitHub Environments settings URL for a repository.
 *
 * @param github - Parsed GitHub repository
 */
export function githubEnvironmentsUrl(github: GitHubRepo): string {
  return `https://github.com/${github.org}/${github.repo}/settings/environments`;
}
