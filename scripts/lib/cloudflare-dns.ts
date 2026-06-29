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
};

export type EnsureCloudflareDnsRecordOptions = {
  /** Cloudflare proxy (orange cloud). Clerk CNAMEs must stay `false`. */
  proxied?: boolean;
};

/**
 * Creates a DNS record when no matching record exists in the zone.
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
): Promise<"created" | "exists"> {
  const proxied = options?.proxied ?? false;
  const existing = await cloudflareFetch<CloudflareDnsRecord[]>(
    token,
    `/zones/${zone.id}/dns_records?type=${encodeURIComponent(record.type)}&name=${encodeURIComponent(record.name)}`,
  );
  const match = existing.find(
    (row) =>
      row.type.toUpperCase() === record.type &&
      row.name.toLowerCase() === record.name.toLowerCase() &&
      row.content.toLowerCase() === record.content.toLowerCase(),
  );
  if (match) {
    return "exists";
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
): Promise<{ created: number; existing: number }> {
  let created = 0;
  let existing = 0;
  for (const record of records) {
    const result = await ensureCloudflareDnsRecord(token, zone, record);
    if (result === "created") {
      created += 1;
    } else {
      existing += 1;
    }
  }
  return { created, existing };
}
