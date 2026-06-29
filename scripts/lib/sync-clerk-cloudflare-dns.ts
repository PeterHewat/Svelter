/* eslint-disable no-console -- CLI wizard */
import {
  clerkBindZonePath,
  readClerkBindZoneRecords,
  type BindDnsRecord,
} from "./clerk-dns-zone";
import { fetchClerkDomainDnsRecords } from "./clerk-domain-dns";
import {
  CloudflareApiError,
  findZoneByName,
  formatCloudflareApiError,
  type CloudflareZone,
} from "./cloudflare-api";
import { resolveCloudflareApiToken } from "./cloudflare-auth";
import { importClerkDnsRecordsToCloudflare } from "./cloudflare-dns";
import { cloudflareZoneDnsUrl } from "./platform-urls";
import { printManualAction } from "./manual-action";

export type ResolveClerkDnsRecordsResult = {
  records: BindDnsRecord[];
  source: "clerk_api" | "bind_zone" | null;
};

/**
 * Resolves Clerk production DNS records from the Backend API, then BIND fallback.
 *
 * @param root - Repository root
 * @param apex - Apex domain
 * @param clerkSecretKey - Optional Clerk production secret (`sk_live_…`)
 */
export async function resolveClerkDnsRecords(
  root: string,
  apex: string,
  clerkSecretKey?: string,
): Promise<ResolveClerkDnsRecordsResult> {
  const secretKey = clerkSecretKey?.trim();
  if (secretKey?.startsWith("sk_live_")) {
    const fromApi = await fetchClerkDomainDnsRecords(secretKey, apex);
    if (fromApi?.length) {
      return { records: fromApi, source: "clerk_api" };
    }
  }

  const fromZone = readClerkBindZoneRecords(root, apex);
  if (fromZone?.length) {
    return { records: fromZone, source: "bind_zone" };
  }

  return { records: [], source: null };
}

/**
 * Returns the Cloudflare zone for an apex domain when the API token can see it.
 *
 * @param root - Repository root
 * @param apex - Apex domain
 */
export async function findApexCloudflareZone(
  root: string,
  apex: string,
): Promise<CloudflareZone | null> {
  const resolved = await resolveCloudflareApiToken(root);
  if (!resolved) {
    return null;
  }
  try {
    return await findZoneByName(resolved.token, apex);
  } catch {
    return null;
  }
}

/**
 * Imports Clerk DNS records into Cloudflare (DNS-only CNAMEs).
 *
 * @param token - Cloudflare API token
 * @param zone - Cloudflare zone for the apex
 * @param records - Clerk CNAME records
 * @param source - Where the records were resolved from
 */
export async function syncClerkDnsRecordsToCloudflare(
  token: string,
  zone: CloudflareZone,
  records: BindDnsRecord[],
  source: ResolveClerkDnsRecordsResult["source"],
): Promise<void> {
  if (records.length === 0) {
    return;
  }

  const { created, existing } = await importClerkDnsRecordsToCloudflare(
    token,
    zone,
    records,
  );
  const sourceLabel =
    source === "clerk_api" ? "Clerk API" : "clerk BIND zone file";
  if (created > 0) {
    console.log(
      `✓ Imported ${created} Clerk DNS record(s) into Cloudflare (${existing} already present; ${sourceLabel})`,
    );
  } else if (existing > 0) {
    console.log(
      `✓ Clerk DNS records already present in Cloudflare (${existing}; ${sourceLabel})`,
    );
  }

  console.log(
    `  Clerk CNAMEs must stay DNS-only (grey cloud): ${cloudflareZoneDnsUrl(zone.name)}`,
  );
}

/**
 * Resolves Clerk DNS and imports into Cloudflare when records are available.
 *
 * @param root - Repository root
 * @param token - Cloudflare API token
 * @param zone - Cloudflare zone for the apex
 * @param apex - Apex domain
 * @param clerkSecretKey - Optional Clerk production secret (`sk_live_…`)
 */
export async function syncClerkDnsToCloudflare(
  root: string,
  token: string,
  zone: CloudflareZone,
  apex: string,
  clerkSecretKey?: string,
): Promise<void> {
  const resolved = await resolveClerkDnsRecords(root, apex, clerkSecretKey);
  await syncClerkDnsRecordsToCloudflare(
    token,
    zone,
    resolved.records,
    resolved.source,
  );
}

/** @deprecated Use {@link syncClerkDnsToCloudflare}. */
export async function syncClerkBindZoneToCloudflare(
  root: string,
  token: string,
  zone: CloudflareZone,
  apex: string,
  clerkSecretKey?: string,
): Promise<void> {
  await syncClerkDnsToCloudflare(root, token, zone, apex, clerkSecretKey);
}

/**
 * Best-effort import of Clerk DNS into Cloudflare DNS.
 *
 * @param root - Repository root
 * @param apex - Apex domain
 * @param clerkSecretKey - Optional Clerk production secret (`sk_live_…`)
 */
export async function trySyncClerkBindZoneForApex(
  root: string,
  apex: string,
  clerkSecretKey?: string,
): Promise<void> {
  const clerkDns = await resolveClerkDnsRecords(root, apex, clerkSecretKey);
  if (!clerkDns.records.length) {
    return;
  }

  const resolved = await resolveCloudflareApiToken(root);
  if (!resolved) {
    console.log("○ Clerk DNS import skipped — no Cloudflare API token");
    printClerkDnsImportFallback(root, apex);
    return;
  }

  try {
    const zone = await findZoneByName(resolved.token, apex);
    if (!zone) {
      console.log(
        `○ Clerk DNS import skipped — no Cloudflare zone for ${apex}`,
      );
      return;
    }
    await syncClerkDnsRecordsToCloudflare(
      resolved.token,
      zone,
      clerkDns.records,
      clerkDns.source,
    );
  } catch (err) {
    const detail =
      err instanceof CloudflareApiError
        ? formatCloudflareApiError(err)
        : String(err).slice(0, 120);
    console.log(`○ Clerk DNS import via API failed — ${detail}`);
    if (resolved.source === "wrangler_oauth") {
      console.log(
        "  `wrangler login` usually cannot edit DNS — use a long-lived API token or Import in the dashboard",
      );
    }
    printClerkDnsImportFallback(root, apex);
  }
}

/**
 * Dashboard fallback when API import of Clerk DNS records is unavailable.
 *
 * @param root - Repository root
 * @param apex - Apex domain
 */
export function printClerkDnsImportFallback(root: string, apex: string): void {
  const zoneFile = clerkBindZonePath(root, apex);
  printManualAction("Import Clerk DNS records into Cloudflare", [
    cloudflareZoneDnsUrl(apex),
    `DNS → Import → upload or paste ${zoneFile}`,
    "Or add each CNAME from Clerk Dashboard → Domains (DNS-only / grey cloud)",
  ]);
}

/**
 * Prints guidance when Clerk production deploy runs before a Cloudflare zone exists.
 *
 * @param apex - Apex domain
 */
export function printClerkDeferredUntilCloudflareZone(apex: string): void {
  printManualAction(
    "Create the Cloudflare zone before Clerk production deploy",
    [
      `Dashboard → Domains → Add a domain → ${apex} (Free plan)`,
      "Clerk DNS records belong in Cloudflare DNS — not as individual CNAMEs at your registrar",
      "After `clerk deploy`, setup syncs Clerk DNS from the Backend API (BIND file fallback in `.svelter/`)",
      "Then point registrar nameservers at Cloudflare — setup prints generic registrar steps",
      "Re-run `bun run setup` when the zone exists",
    ],
  );
}
