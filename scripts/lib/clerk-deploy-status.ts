/* eslint-disable no-console -- CLI wizard */
import { resolveCloudflareApiToken } from "./cloudflare-auth";
import { findZoneByName } from "./cloudflare-api";
import {
  syncClerkDnsRecordsToCloudflare,
  type ResolveClerkDnsRecordsResult,
} from "./sync-clerk-cloudflare-dns";
import type { BindDnsRecord } from "./clerk-dns-zone";

/** Clerk `deploy status --mode agent` lifecycle state. */
export type ClerkDeployStatusState =
  | "not_started"
  | "domain_provisioning"
  | "domain_pending"
  | "oauth_pending"
  | "complete";

/** Pending DNS row from Clerk deploy status JSON. */
export type ClerkDeployPendingDnsRecord = {
  type: string;
  host: string;
  value: string;
};

/** Parsed `clerk deploy status --mode agent` report. */
export type ClerkDeployStatusReport = {
  complete: boolean;
  state: ClerkDeployStatusState;
  domain: string | null;
  productionInstanceId: string | null;
  domainStatus: { dns: string; ssl: string; mail: string } | null;
  pendingDnsRecords: ClerkDeployPendingDnsRecord[];
  oauth: {
    complete: boolean;
    configured: string[];
    pending: string[];
    unsupported: string[];
  };
  nextAction: string;
};

/**
 * Parses JSON stdout from `clerk deploy status --mode agent`.
 *
 * @param stdout - Raw CLI stdout (agent mode emits a single JSON object)
 * @returns Parsed report, or null when stdout is not valid JSON
 */
export function parseClerkDeployStatusReport(
  stdout: string,
): ClerkDeployStatusReport | null {
  const trimmed = stdout.trim();
  if (!trimmed.startsWith("{")) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed) as Partial<ClerkDeployStatusReport>;
    if (
      typeof parsed.complete !== "boolean" ||
      typeof parsed.state !== "string"
    ) {
      return null;
    }
    return {
      complete: parsed.complete,
      state: parsed.state as ClerkDeployStatusState,
      domain: parsed.domain ?? null,
      productionInstanceId: parsed.productionInstanceId ?? null,
      domainStatus: parsed.domainStatus ?? null,
      pendingDnsRecords: Array.isArray(parsed.pendingDnsRecords)
        ? parsed.pendingDnsRecords.filter(
            (row): row is ClerkDeployPendingDnsRecord =>
              Boolean(row) &&
              typeof row === "object" &&
              typeof (row as ClerkDeployPendingDnsRecord).host === "string" &&
              typeof (row as ClerkDeployPendingDnsRecord).value === "string",
          )
        : [],
      oauth: {
        complete: parsed.oauth?.complete ?? false,
        configured: parsed.oauth?.configured ?? [],
        pending: parsed.oauth?.pending ?? [],
        unsupported: parsed.oauth?.unsupported ?? [],
      },
      nextAction: parsed.nextAction ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Converts Clerk deploy-status pending DNS rows to BIND-style records.
 *
 * @param records - `pendingDnsRecords` from deploy status JSON
 */
export function clerkPendingDnsRecordsToBind(
  records: ClerkDeployPendingDnsRecord[],
): BindDnsRecord[] {
  return records.map((row) => ({
    name: row.host.replace(/\.$/, ""),
    type: row.type.toUpperCase(),
    content: row.value.replace(/\.$/, ""),
  }));
}

/**
 * Imports pending Clerk DNS rows from deploy status into Cloudflare.
 *
 * @param root - Repository root
 * @param apex - Apex domain (Cloudflare zone name)
 * @param pending - Pending DNS rows from deploy status
 * @returns Whether any records were synced
 */
export async function syncPendingClerkDnsRecordsToCloudflare(
  root: string,
  apex: string,
  pending: ClerkDeployPendingDnsRecord[],
): Promise<boolean> {
  const records = clerkPendingDnsRecordsToBind(pending);
  if (records.length === 0) {
    return false;
  }
  const resolved = await resolveCloudflareApiToken(root);
  if (!resolved) {
    console.log("○ Clerk DNS sync skipped — no Cloudflare API token");
    return false;
  }
  try {
    const zone = await findZoneByName(resolved.token, apex);
    if (!zone) {
      console.log(`○ Clerk DNS sync skipped — no Cloudflare zone for ${apex}`);
      return false;
    }
    const source: ResolveClerkDnsRecordsResult["source"] = "clerk_api";
    await syncClerkDnsRecordsToCloudflare(
      resolved.token,
      zone,
      records,
      source,
    );
    return true;
  } catch (err) {
    console.log(
      `○ Clerk DNS sync from deploy status failed — ${String(err).slice(0, 120)}`,
    );
    return false;
  }
}
