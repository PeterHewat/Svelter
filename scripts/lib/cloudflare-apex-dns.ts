/* eslint-disable no-console -- CLI wizard */
import { deriveProductionHostnames } from "../../packages/config/hostnames";
import {
  CloudflareApiError,
  findPagesProjectByName,
  findZoneByName,
  formatCloudflareApiError,
  isCloudflareAuthError,
  type CloudflareZone,
} from "./cloudflare-api";
import {
  getSessionCloudflareApiToken,
  resolveCloudflareApiToken,
  type ResolvedCloudflareToken,
} from "./cloudflare-auth";
import { ensureCloudflareDnsRecord } from "./cloudflare-dns";
import { cloudflareApexDnsAutomationFailedSteps } from "./cloudflare-manual-steps";
import { cloudflareZoneDnsUrl } from "./platform-urls";
import { printManualAction } from "./manual-action";
import { clerkBindZonePath, readClerkBindZoneRecords } from "./clerk-dns-zone";
import { syncClerkDnsToCloudflare } from "./sync-clerk-cloudflare-dns";
import { readClerkProductionSecretKey } from "./clerk-web-env";
import type { SetupConfig } from "./setup-config";
import { hasApexDomain } from "../../packages/config/validate-domain";

let apexDnsSyncedThisSetupRun = false;

/**
 * Clears the per-run DNS sync guard (tests).
 */
export function resetApexDnsSyncSession(): void {
  apexDnsSyncedThisSetupRun = false;
}

/**
 * Resolves the `*.pages.dev` hostname for a Pages project.
 *
 * Cloudflare may assign a suffixed subdomain when the default name is taken.
 *
 * @param projectName - Pages project name
 * @param subdomain - Optional subdomain from the Pages API
 */
export function resolvePagesSubdomain(
  projectName: string,
  subdomain?: string,
): string {
  const trimmed = subdomain?.trim();
  return trimmed || `${projectName}.pages.dev`;
}

/**
 * Ensures proxied CNAMEs for production Pages custom domains (apex + www).
 *
 * @param token - Cloudflare API token with Zone DNS Edit
 * @param accountId - Cloudflare account ID
 * @param zone - Apex zone
 * @param apex - Apex domain
 * @param webProject - Web Pages project name
 * @param marketingProject - Marketing Pages project name
 */
export async function syncPagesHostingDnsRecords(
  token: string,
  accountId: string,
  zone: CloudflareZone,
  apex: string,
  webProject: string,
  marketingProject: string,
): Promise<{ created: number; existing: number }> {
  const hostnames = deriveProductionHostnames(apex);
  const webPages = await findPagesProjectByName(token, accountId, webProject);
  const marketingPages = await findPagesProjectByName(
    token,
    accountId,
    marketingProject,
  );
  const pairs: Array<{ name: string; target: string }> = [
    {
      name: hostnames.webProduction,
      target: resolvePagesSubdomain(webProject, webPages?.subdomain),
    },
    {
      name: hostnames.marketingProduction,
      target: resolvePagesSubdomain(
        marketingProject,
        marketingPages?.subdomain,
      ),
    },
  ];

  let created = 0;
  let existing = 0;
  for (const { name, target } of pairs) {
    const result = await ensureCloudflareDnsRecord(
      token,
      zone,
      { name, type: "CNAME", content: target },
      { proxied: true },
    );
    if (
      result === "created" ||
      result === "updated" ||
      result === "fixed_proxy"
    ) {
      created += 1;
    } else {
      existing += 1;
    }
  }
  return { created, existing };
}

/**
 * Imports Clerk BIND records and Pages CNAMEs into Cloudflare DNS.
 *
 * @param root - Repository root
 * @param token - Cloudflare API token with Zone DNS Edit
 * @param accountId - Cloudflare account ID
 * @param apex - Apex domain
 * @param webProject - Web Pages project name
 * @param marketingProject - Marketing Pages project name
 * @param clerkSecretKey - Optional Clerk production secret (`sk_live_…`)
 */
export async function syncApexDnsRecords(
  root: string,
  token: string,
  accountId: string,
  apex: string,
  webProject: string,
  marketingProject: string,
  clerkSecretKey?: string,
): Promise<void> {
  const zone = await findZoneByName(token, apex);
  if (!zone) {
    console.log(`○ DNS sync skipped — no Cloudflare zone for ${apex}`);
    return;
  }

  const pages = await syncPagesHostingDnsRecords(
    token,
    accountId,
    zone,
    apex,
    webProject,
    marketingProject,
  );
  if (pages.created > 0) {
    console.log(
      `✓ Created ${pages.created} Pages DNS record(s) (${pages.existing} already present)`,
    );
  } else if (pages.existing > 0) {
    console.log(`✓ Pages DNS records already present (${pages.existing})`);
  }

  await syncClerkDnsToCloudflare(root, token, zone, apex, clerkSecretKey);
}

function printApexDnsImportFallback(
  root: string,
  apex: string,
  accountId?: string,
  webProject?: string,
  marketingProject?: string,
): void {
  const zoneFile = clerkBindZonePath(root, apex);
  const hasClerkZone = Boolean(readClerkBindZoneRecords(root, apex)?.length);
  const steps =
    accountId && webProject && marketingProject
      ? cloudflareApexDnsAutomationFailedSteps(
          apex,
          accountId,
          webProject,
          marketingProject,
        )
      : [
          cloudflareZoneDnsUrl(apex),
          "Re-run `bun run setup` and paste a Cloudflare API token with Zone → DNS → Edit when prompted",
          "Setup creates Pages CNAMEs and Clerk CNAMEs automatically — no manual records unless API sync fails",
          hasClerkZone
            ? `Clerk BIND fallback: ${zoneFile}`
            : "Clerk CNAMEs appear after `clerk deploy` — setup imports them via API",
        ];
  printManualAction("Automated DNS sync failed", steps);
}

type ApexDnsSyncAttempt =
  { ok: true } | { ok: false; auth: boolean; detail: string };

async function attemptApexDnsSync(
  root: string,
  token: string,
  accountId: string,
  apex: string,
  webProject: string,
  marketingProject: string,
  clerkSecretKey?: string,
): Promise<ApexDnsSyncAttempt> {
  try {
    await syncApexDnsRecords(
      root,
      token,
      accountId,
      apex,
      webProject,
      marketingProject,
      clerkSecretKey,
    );
    return { ok: true };
  } catch (err) {
    const detail =
      err instanceof CloudflareApiError
        ? formatCloudflareApiError(err)
        : String(err).slice(0, 120);
    const auth =
      err instanceof CloudflareApiError && isCloudflareAuthError(err);
    return { ok: false, auth, detail };
  }
}

/**
 * Syncs Pages + Clerk DNS into Cloudflare, retrying with a pasted API token when
 * `wrangler login` OAuth cannot edit zone DNS.
 *
 * @param root - Repository root
 * @param resolved - API token and how it was obtained
 * @param accountId - Cloudflare account ID
 * @param apex - Apex domain
 * @param webProject - Web Pages project name
 * @param marketingProject - Marketing Pages project name
 * @param clerkSecretKey - Optional Clerk production secret (`sk_live_…`)
 * @returns Whether DNS sync succeeded
 */
export async function syncApexDnsForHosting(
  root: string,
  resolved: ResolvedCloudflareToken,
  accountId: string,
  apex: string,
  webProject: string,
  marketingProject: string,
  clerkSecretKey?: string,
): Promise<boolean> {
  let result = await attemptApexDnsSync(
    root,
    resolved.token,
    accountId,
    apex,
    webProject,
    marketingProject,
    clerkSecretKey,
  );

  if (
    !result.ok &&
    result.auth &&
    resolved.source === "wrangler_oauth" &&
    Boolean(process.stdin.isTTY)
  ) {
    console.log("○ Apex DNS sync via API failed — Authentication error");
    console.log(
      "  `wrangler login` cannot edit zone DNS — paste a long-lived API token to continue",
    );
    const durable = await resolveCloudflareApiToken(root, {
      durableOnly: true,
      interactive: true,
    });
    if (durable) {
      result = await attemptApexDnsSync(
        root,
        durable.token,
        accountId,
        apex,
        webProject,
        marketingProject,
        clerkSecretKey,
      );
    }
  }

  if (result.ok) {
    apexDnsSyncedThisSetupRun = true;
    return true;
  }

  console.log(`○ Apex DNS sync via API failed — ${result.detail}`);
  if (resolved.source === "wrangler_oauth") {
    console.log(
      "  `wrangler login` usually cannot edit DNS — paste a long-lived API token when setup prompts",
    );
  }
  printApexDnsImportFallback(
    root,
    apex,
    accountId,
    webProject,
    marketingProject,
  );
  return false;
}

/**
 * Best-effort sync of Pages + Clerk DNS into Cloudflare for the apex zone.
 *
 * Retries with a pasted long-lived token when `wrangler login` OAuth cannot edit DNS.
 *
 * @param root - Repository root
 * @param setup - Persisted setup config
 */
export async function trySyncApexDnsToCloudflare(
  root: string,
  setup: SetupConfig,
): Promise<void> {
  if (apexDnsSyncedThisSetupRun) {
    return;
  }
  if (!hasApexDomain(setup.apexDomain)) {
    return;
  }
  const meta = setup.cloudflare;
  if (!meta?.accountId || !meta.projectNameWeb || !meta.projectNameMarketing) {
    return;
  }
  const apex = setup.apexDomain!;
  const clerkSecretKey = readClerkProductionSecretKey(root);

  const resolved =
    getSessionCloudflareApiToken() ?? (await resolveCloudflareApiToken(root));
  if (!resolved) {
    console.log("○ Apex DNS sync skipped — no Cloudflare API token");
    printApexDnsImportFallback(root, apex);
    return;
  }

  await syncApexDnsForHosting(
    root,
    resolved,
    meta.accountId,
    apex,
    meta.projectNameWeb,
    meta.projectNameMarketing,
    clerkSecretKey,
  );
}
