import {
  CloudflareApiError,
  cloudflareFetch,
  isCloudflareAlreadyExistsError,
  type CloudflareZone,
} from "./cloudflare-api";
import type { BindDnsRecord } from "./clerk-dns-zone";

type CloudflareDnsRecord = {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied?: boolean;
};

export type EnsureCloudflareDnsRecordOptions = {
  /** Cloudflare proxy (orange cloud). Clerk CNAMEs must stay `false`. */
  proxied?: boolean;
};

export type EnsureCloudflareDnsRecordResult =
  "created" | "exists" | "updated" | "fixed_proxy";

export type ImportClerkDnsRecordsResult = {
  created: number;
  updated: number;
  fixedProxy: number;
  existing: number;
};

function normalizeDnsName(name: string): string {
  return name.trim().toLowerCase().replace(/\.$/, "");
}

function normalizeDnsContent(content: string): string {
  return content.trim().toLowerCase().replace(/\.$/, "");
}

/**
 * Creates or updates a DNS record when name/type match but content or proxy differs.
 *
 * @param token - Cloudflare API token
 * @param zone - Cloudflare zone
 * @param record - Record to ensure
 * @param options - Optional proxy status
 */
export async function ensureCloudflareDnsRecord(
  token: string,
  zone: CloudflareZone,
  record: BindDnsRecord,
  options?: EnsureCloudflareDnsRecordOptions,
): Promise<EnsureCloudflareDnsRecordResult> {
  const proxied = options?.proxied ?? false;
  const existing = await cloudflareFetch<CloudflareDnsRecord[]>(
    token,
    `/zones/${zone.id}/dns_records?type=${encodeURIComponent(record.type)}&name=${encodeURIComponent(record.name)}`,
  );

  const sameName = existing.find(
    (row) =>
      row.type.toUpperCase() === record.type.toUpperCase() &&
      normalizeDnsName(row.name) === normalizeDnsName(record.name),
  );

  if (sameName) {
    const contentMatch =
      normalizeDnsContent(sameName.content) ===
      normalizeDnsContent(record.content);
    const proxiedMatch = (sameName.proxied ?? false) === proxied;

    if (contentMatch && proxiedMatch) {
      return "exists";
    }

    await cloudflareFetch(
      token,
      `/zones/${zone.id}/dns_records/${sameName.id}`,
      {
        method: "PATCH",
        body: {
          type: record.type,
          name: record.name,
          content: record.content,
          proxied,
        },
      },
    );

    if (!contentMatch) {
      return "updated";
    }
    return "fixed_proxy";
  }

  try {
    await cloudflareFetch(token, `/zones/${zone.id}/dns_records`, {
      method: "POST",
      body: {
        type: record.type,
        name: record.name,
        content: record.content,
        proxied,
      },
    });
    return "created";
  } catch (err) {
    if (
      err instanceof CloudflareApiError &&
      isCloudflareAlreadyExistsError(err)
    ) {
      return "exists";
    }
    throw err;
  }
}

/**
 * Imports Clerk BIND zone records into Cloudflare DNS (DNS-only CNAMEs).
 *
 * @param token - Cloudflare API token
 * @param zone - Target zone
 * @param records - Parsed BIND records
 */
export async function importClerkDnsRecordsToCloudflare(
  token: string,
  zone: CloudflareZone,
  records: BindDnsRecord[],
): Promise<ImportClerkDnsRecordsResult> {
  const result: ImportClerkDnsRecordsResult = {
    created: 0,
    updated: 0,
    fixedProxy: 0,
    existing: 0,
  };

  for (const record of records) {
    const outcome = await ensureCloudflareDnsRecord(token, zone, record);
    if (outcome === "created") {
      result.created += 1;
    } else if (outcome === "updated") {
      result.updated += 1;
    } else if (outcome === "fixed_proxy") {
      result.fixedProxy += 1;
    } else {
      result.existing += 1;
    }
  }

  return result;
}
