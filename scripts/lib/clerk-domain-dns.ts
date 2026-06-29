import type { BindDnsRecord } from "./clerk-dns-zone";

export type ClerkCnameTarget = {
  host: string;
  value: string;
  required?: boolean;
};

export type ClerkDomain = {
  name: string;
  is_satellite?: boolean;
  cname_targets?: ClerkCnameTarget[];
};

type ClerkDomainsListResponse =
  ClerkDomain[] | { data?: ClerkDomain[]; total_count?: number };

/**
 * Parses a Clerk `GET /v1/domains` response body.
 *
 * @param body - Raw JSON from the Clerk Backend API
 */
export function parseClerkDomainsListResponse(body: unknown): ClerkDomain[] {
  if (Array.isArray(body)) {
    return body;
  }
  if (
    body &&
    typeof body === "object" &&
    Array.isArray(
      (body as ClerkDomainsListResponse & { data?: ClerkDomain[] }).data,
    )
  ) {
    return (body as { data: ClerkDomain[] }).data;
  }
  return [];
}

/**
 * Maps Clerk `cname_targets` to Cloudflare BIND-style records.
 *
 * @param targets - CNAME targets from the Clerk Domains API
 */
export function clerkCnameTargetsToBindRecords(
  targets: ClerkCnameTarget[],
): BindDnsRecord[] {
  const records: BindDnsRecord[] = [];
  for (const target of targets) {
    const name = target.host?.trim().replace(/\.$/, "");
    const content = target.value?.trim().replace(/\.$/, "");
    if (!name || !content) {
      continue;
    }
    records.push({ name, type: "CNAME", content });
  }
  return records;
}

/**
 * Picks the production apex domain entry from a Clerk domains list.
 *
 * @param domains - Domains from the Clerk Backend API
 * @param apex - Apex domain (e.g. `example.com`)
 */
export function findClerkDomainForApex(
  domains: ClerkDomain[],
  apex: string,
): ClerkDomain | null {
  const normalizedApex = apex.trim().toLowerCase();
  const primary =
    domains.find(
      (domain) =>
        !domain.is_satellite &&
        domain.name.trim().toLowerCase() === normalizedApex,
    ) ??
    domains.find(
      (domain) => domain.name.trim().toLowerCase() === normalizedApex,
    ) ??
    domains.find((domain) => !domain.is_satellite);
  return primary ?? null;
}

/**
 * Fetches required Clerk production DNS records via the Backend API.
 *
 * @param secretKey - Clerk production secret key (`sk_live_…`)
 * @param apex - Apex domain for the production instance
 */
export async function fetchClerkDomainDnsRecords(
  secretKey: string,
  apex: string,
): Promise<BindDnsRecord[] | null> {
  const response = await fetch("https://api.clerk.com/v1/domains", {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });
  if (!response.ok) {
    return null;
  }
  const body = (await response.json()) as unknown;
  const domains = parseClerkDomainsListResponse(body);
  const domain = findClerkDomainForApex(domains, apex);
  if (!domain?.cname_targets?.length) {
    return null;
  }
  const records = clerkCnameTargetsToBindRecords(domain.cname_targets);
  return records.length > 0 ? records : null;
}
