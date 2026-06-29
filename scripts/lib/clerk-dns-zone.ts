import { existsSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** A DNS record parsed from a BIND-style zone snippet. */
export type BindDnsRecord = {
  name: string;
  type: string;
  content: string;
};

const SVELTER_DIR = ".svelter";

/**
 * Path to `.svelter/clerk-{apex}.zone` (relocated after `clerk deploy`).
 *
 * @param root - Repository root
 * @param apex - Apex domain
 */
export function clerkBindZonePath(root: string, apex: string): string {
  return resolve(root, SVELTER_DIR, `clerk-${apex}.zone`);
}

/**
 * Legacy path where `clerk deploy` writes the BIND export (repo root).
 *
 * @param root - Repository root
 * @param apex - Apex domain
 */
export function legacyClerkBindZonePath(root: string, apex: string): string {
  return resolve(root, `clerk-${apex}.zone`);
}

/**
 * Moves `clerk-{apex}.zone` from repo root into `.svelter/` when present.
 *
 * @param root - Repository root
 * @param apex - Apex domain
 * @returns Destination path when a file was found or already in `.svelter/`
 */
export function relocateClerkBindZoneToSvelter(
  root: string,
  apex: string,
): string | null {
  const dest = clerkBindZonePath(root, apex);
  if (existsSync(dest)) {
    return dest;
  }
  const legacy = legacyClerkBindZonePath(root, apex);
  if (!existsSync(legacy)) {
    return null;
  }
  mkdirSync(dirname(dest), { recursive: true });
  renameSync(legacy, dest);
  return dest;
}

/**
 * Parses Clerk BIND zone export lines (`name IN TYPE content`).
 *
 * @param content - Zone file contents
 */
export function parseClerkBindZone(content: string): BindDnsRecord[] {
  const records: BindDnsRecord[] = [];
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(";") || trimmed.startsWith("$")) {
      continue;
    }
    const match = trimmed.match(/^(\S+)\s+IN\s+(\S+)\s+(\S+)/i);
    if (!match) {
      continue;
    }
    records.push({
      name: match[1].replace(/\.$/, ""),
      type: match[2].toUpperCase(),
      content: match[3].replace(/\.$/, ""),
    });
  }
  return records;
}

function readClerkBindZoneFile(path: string): BindDnsRecord[] | null {
  if (!existsSync(path)) {
    return null;
  }
  const records = parseClerkBindZone(readFileSync(path, "utf8"));
  return records.length > 0 ? records : null;
}

/**
 * Reads Clerk DNS records from `.svelter/clerk-{apex}.zone`, then legacy repo root.
 *
 * @param root - Repository root
 * @param apex - Apex domain
 */
export function readClerkBindZoneRecords(
  root: string,
  apex: string,
): BindDnsRecord[] | null {
  relocateClerkBindZoneToSvelter(root, apex);
  return (
    readClerkBindZoneFile(clerkBindZonePath(root, apex)) ??
    readClerkBindZoneFile(legacyClerkBindZonePath(root, apex))
  );
}
