import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { GitHubRepo } from "./repo-identity";

/** GitHub secret sync steps performed by setup (`gh secret set`). */
export type GitHubSyncedSecrets = {
  /** Repository secrets for PR CI and E2E (dev Convex). */
  repo?: boolean;
  /** GitHub `production` environment secrets for `release-*` tags. */
  production?: boolean;
  /** Repository secrets for Cloudflare Pages deploy workflows. */
  cloudflare?: boolean;
};

export type CloudflareSetupMeta = {
  /** Pages projects, domains, and secrets configured via setup. */
  synced?: boolean;
  /** User confirmed registrar nameservers at Cloudflare (setup pauses until true). */
  dnsConfigured?: boolean;
  accountId: string;
  projectNameWeb: string;
  projectNameMarketing: string;
};

export type SetupConfig = {
  productName: string;
  productTagLine: string;
  /** Omit until you own a domain — re-run setup to attach custom hostnames. */
  apexDomain?: string;
  github: {
    org: string;
    repo: string;
    /** Issue/PR labels synced via `gh label create` (one-time). */
    labelsSynced?: boolean;
    syncedSecrets?: GitHubSyncedSecrets;
  } | null;
  /** When true, setup replaces MIT `LICENSE` with the proprietary stub. */
  removeMitLicense?: boolean;
  cloudflare?: CloudflareSetupMeta;
};

const REL_PATH = ".svelter/setup.json";

/**
 * Absolute path to `.svelter/setup.json`.
 *
 * @param root - Repository root
 */
export function setupConfigPath(root: string): string {
  return resolve(root, REL_PATH);
}

/**
 * Reads `.svelter/setup.json` when present.
 *
 * @param root - Repository root
 */
export function readSetupConfig(root: string): SetupConfig | null {
  const path = setupConfigPath(root);
  if (!existsSync(path)) {
    return null;
  }
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as SetupConfig;
    if (!parsed.productName) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Writes `.svelter/setup.json`.
 *
 * @param root - Repository root
 * @param config - Setup config to persist
 */
export function writeSetupConfig(root: string, config: SetupConfig): void {
  const path = setupConfigPath(root);
  mkdirSync(resolve(root, ".svelter"), { recursive: true });
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
}

/**
 * Builds a new setup config object.
 *
 * @param productName - Display product name
 * @param productTagLine - Marketing tagline
 * @param apexDomain - Apex domain, when configured
 * @param github - Parsed GitHub remote, if any
 */
export function buildSetupConfig(
  productName: string,
  productTagLine: string,
  apexDomain: string | undefined,
  github: GitHubRepo | null,
  existing?: SetupConfig | null,
  removeMitLicense?: boolean,
): SetupConfig {
  return {
    productName,
    productTagLine,
    ...(apexDomain ? { apexDomain } : {}),
    github: github
      ? {
          org: github.org,
          repo: github.repo,
          labelsSynced: existing?.github?.labelsSynced,
          syncedSecrets: existing?.github?.syncedSecrets,
        }
      : null,
    removeMitLicense,
    cloudflare: existing?.cloudflare,
  };
}

/**
 * Marks one GitHub secret sync step as completed in setup config.
 *
 * @param root - Repository root
 * @param key - Which sync step completed
 */
function markGitHubSecretSynced(
  root: string,
  key: keyof GitHubSyncedSecrets,
): void {
  const config = readSetupConfig(root);
  if (!config?.github) {
    return;
  }
  writeSetupConfig(root, {
    ...config,
    github: {
      ...config.github,
      syncedSecrets: { ...config.github.syncedSecrets, [key]: true },
    },
  });
}

/**
 * Records that dev GitHub repository secrets were synced by setup.
 *
 * @param root - Repository root
 */
export function markGithubSecretsSynced(root: string): void {
  markGitHubSecretSynced(root, "repo");
}

/**
 * Records that GitHub issue/PR labels were synced by setup.
 *
 * @param root - Repository root
 */
export function markGithubLabelsSynced(root: string): void {
  const config = readSetupConfig(root);
  if (!config?.github) {
    return;
  }
  writeSetupConfig(root, {
    ...config,
    github: { ...config.github, labelsSynced: true },
  });
}

/**
 * Records Cloudflare Pages metadata after a successful bootstrap.
 *
 * @param root - Repository root
 * @param cloudflare - Account and project names
 */
export function markCloudflareSynced(
  root: string,
  cloudflare: CloudflareSetupMeta,
): void {
  const config = readSetupConfig(root);
  if (!config) {
    return;
  }
  writeSetupConfig(root, {
    ...config,
    cloudflare: { ...config.cloudflare, ...cloudflare, synced: true },
  });
}

/**
 * Records that the user confirmed registrar nameservers point to Cloudflare.
 *
 * @param root - Repository root
 */
export function markCloudflareDnsConfigured(root: string): void {
  const config = readSetupConfig(root);
  if (!config?.cloudflare) {
    return;
  }
  writeSetupConfig(root, {
    ...config,
    cloudflare: { ...config.cloudflare, dnsConfigured: true },
  });
}

/**
 * Records that Cloudflare deploy secrets were synced to GitHub repository secrets.
 *
 * @param root - Repository root
 */
export function markCloudflareGithubSecretsSynced(root: string): void {
  markGitHubSecretSynced(root, "cloudflare");
}

/**
 * Records that production GitHub environment secrets were synced by setup.
 *
 * @param root - Repository root
 */
export function markProductionGithubSecretsSynced(root: string): void {
  markGitHubSecretSynced(root, "production");
}
