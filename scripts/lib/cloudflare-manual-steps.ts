import { deriveProductionHostnames } from "../../packages/config/hostnames";
import {
  cloudflarePagesProjectUrl,
  cloudflareZoneDnsUrl,
} from "./platform-urls";

/**
 * One-line note that setup automates Cloudflare DNS (not manual CNAMEs at registrar).
 */
export function cloudflareDnsAutomationNote(): string {
  return "Setup creates Pages and Clerk DNS records in Cloudflare automatically — do not add CNAMEs at your registrar; only point nameservers to Cloudflare when prompted";
}

/**
 * Dashboard fallback when setup cannot attach Cloudflare Pages custom domains via API.
 *
 * @param accountId - Cloudflare account ID
 * @param webProject - Web Pages project name
 * @param marketingProject - Marketing Pages project name
 * @param apex - Apex domain
 */
export function cloudflarePagesCustomDomainManualSteps(
  accountId: string,
  webProject: string,
  marketingProject: string,
  apex: string,
): string[] {
  const { webProduction, marketingProduction } =
    deriveProductionHostnames(apex);
  return [
    "Only if setup reported an API error above — attachment is normally automatic",
    `Web — Cloudflare Pages project "${webProject}": ${cloudflarePagesProjectUrl(accountId, webProject)}`,
    `  → Custom domains → Set up a custom domain → enter ${webProduction} → Continue → Activate`,
    `Marketing — Cloudflare Pages project "${marketingProject}": ${cloudflarePagesProjectUrl(accountId, marketingProject)}`,
    `  → Custom domains → Set up a custom domain → enter ${marketingProduction} → Continue → Activate`,
    cloudflareDnsAutomationNote(),
    `DNS records live here (not at your registrar): ${cloudflareZoneDnsUrl(apex)}`,
  ];
}

/**
 * Steps when automated DNS sync via API failed mid-setup.
 *
 * @param apex - Apex domain
 * @param accountId - Cloudflare account ID
 * @param webProject - Web Pages project name
 * @param marketingProject - Marketing Pages project name
 */
export function cloudflareApexDnsAutomationFailedSteps(
  apex: string,
  accountId: string,
  webProject: string,
  marketingProject: string,
): string[] {
  return [
    "Setup could not write DNS via the Cloudflare API — re-run `bun run setup` and paste a token with Zone → DNS → Edit when prompted",
    cloudflareDnsAutomationNote(),
    `Cloudflare DNS dashboard: ${cloudflareZoneDnsUrl(apex)}`,
    ...cloudflarePagesCustomDomainManualSteps(
      accountId,
      webProject,
      marketingProject,
      apex,
    ).slice(1),
  ];
}

/**
 * Steps when production bootstrap runs before the Cloudflare step finished registrar confirmation.
 *
 * @param apex - Apex domain
 */
export function cloudflareProductionBlockedDnsSteps(apex: string): string[] {
  return [
    "Re-run `bun run setup` — the Cloudflare Pages step will resume (registrar nameserver confirmation)",
    cloudflareDnsAutomationNote(),
    "Pages custom domains and proxied CNAMEs are created by setup — no manual record entry unless an API error was shown",
    `Cloudflare zone DNS: ${cloudflareZoneDnsUrl(apex)}`,
  ];
}
