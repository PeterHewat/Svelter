/* eslint-disable no-console -- CLI wizard */
import {
  deriveProductionHostnames,
  deriveStagingHostnames,
  pagesProductionHostname,
} from "../../packages/config/hostnames";
import {
  hasApexDomain,
  isValidApexDomain,
  normalizeApexDomainInput,
} from "../../packages/config/validate-domain";
import { fetchGitHubRepoDescription } from "./github-repo-meta";
import { pagesProjectNames } from "./hosting-project-spec";
import { shouldOfferLicenseRemoval } from "./license-identity";
import { writeProductName } from "./product-name";
import { readProductTagline, writeProductTagline } from "./product-tagline";
import { promptLine } from "./prompt";
import {
  productNameFromRepo,
  productNameToSlug,
  type GitHubRepo,
} from "./repo-identity";
import {
  buildSetupConfig,
  readSetupConfig,
  writeSetupConfig,
  type SetupConfig,
} from "./setup-config";

/**
 * Prints production and staging hostnames for the product.
 *
 * @param productSlug - Product slug (e.g. `svelter`)
 * @param apexDomain - Optional apex domain for production custom domains
 */
export function printHostnameTable(
  productSlug: string,
  apexDomain?: string,
): void {
  const projects = pagesProjectNames(productSlug);
  const staging = deriveStagingHostnames(projects.web, projects.marketing);
  const productionPages = {
    web: pagesProductionHostname(projects.web),
    marketing: pagesProductionHostname(projects.marketing),
  };
  console.log("\nHostnames");
  console.log(`  Web staging:           https://${staging.web}`);
  console.log(`  Marketing staging:     https://${staging.marketing}`);
  console.log(`  Web production:        https://${productionPages.web}`);
  console.log(`  Marketing production:  https://${productionPages.marketing}`);
  if (apexDomain) {
    const custom = deriveProductionHostnames(apexDomain);
    console.log(`  Web production (apex):  ${custom.webProduction}`);
    console.log(`  Marketing (apex):      ${custom.marketingProduction}`);
  }
}

/**
 * Prompts for an optional apex domain; empty input skips custom hostnames.
 *
 * @param defaultValue - Previous apex domain, if any
 */
async function promptOptionalApexDomain(
  defaultValue?: string,
): Promise<string | undefined> {
  while (true) {
    const raw = await promptLine("Apex domain (Enter to skip)", {
      defaultValue,
      displayDefault: defaultValue ?? "skip",
    });
    if (!raw.trim()) {
      return undefined;
    }
    const normalized = normalizeApexDomainInput(raw);
    if (isValidApexDomain(normalized)) {
      return normalized;
    }
    console.log(
      "  Enter a valid apex domain (e.g. example.com), or press Enter to skip.",
    );
  }
}

/**
 * Persists identity config and applies product name / tagline files.
 *
 * @param root - Repository root
 * @param config - Setup config to write
 */
function persistIdentityConfig(root: string, config: SetupConfig): void {
  writeSetupConfig(root, config);
  if (writeProductName(root, config.productName)) {
    console.log(
      `✓ Updated packages/config/product.ts → "${config.productName}"`,
    );
  }
  if (writeProductTagline(root, config.productTagLine)) {
    console.log(
      `✓ Updated packages/config/product.ts tagline → "${config.productTagLine}"`,
    );
  }
  console.log(`✓ Wrote .svelter/setup.json`);
  printHostnameTable(
    productNameToSlug(config.productName),
    hasApexDomain(config.apexDomain) ? config.apexDomain : undefined,
  );
  if (!hasApexDomain(config.apexDomain)) {
    console.log(
      "  Cloudflare custom domains deferred — Clerk Production still needs a domain you own (can defer in the Production step)",
    );
  }
}

/**
 * Runs interactive identity prompts and persists setup config + product name.
 * Re-runs skip prompts when `.svelter/setup.json` already has product name and tagline.
 *
 * @param root - Repository root
 * @param github - Parsed GitHub remote, if any
 */
export async function runIdentityWizard(
  root: string,
  github: GitHubRepo | null,
): Promise<SetupConfig> {
  const existing = readSetupConfig(root);

  if (
    existing?.productName &&
    existing.productTagLine &&
    hasApexDomain(existing.apexDomain)
  ) {
    console.log("\nIdentity");
    console.log(
      `✓ ${existing.productName} @ ${existing.apexDomain} (from .svelter/setup.json)`,
    );
    const refreshed = buildSetupConfig(
      existing.productName,
      existing.productTagLine,
      existing.apexDomain,
      github,
      existing,
      existing.removeMitLicense,
    );
    if (JSON.stringify(refreshed) !== JSON.stringify(existing)) {
      writeSetupConfig(root, refreshed);
    }
    return refreshed;
  }

  if (existing?.productName && existing.productTagLine) {
    console.log("\nIdentity");
    console.log(
      `✓ ${existing.productName} (no apex domain yet — from .svelter/setup.json)`,
    );
    const apexDomain = await promptOptionalApexDomain(existing.apexDomain);
    const config = buildSetupConfig(
      existing.productName,
      existing.productTagLine,
      apexDomain,
      github,
      existing,
      existing.removeMitLicense,
    );
    if (apexDomain && apexDomain !== existing.apexDomain) {
      persistIdentityConfig(root, config);
    } else if (JSON.stringify(config) !== JSON.stringify(existing)) {
      writeSetupConfig(root, config);
    }
    return config;
  }

  console.log("\nIdentity");
  const defaultName =
    existing?.productName ??
    (github ? productNameFromRepo(github) : undefined) ??
    "Svelter";
  const productName = await promptLine("Product name", {
    defaultValue: defaultName,
  });

  const taglineFromFile = readProductTagline(root);
  const taglineFromGitHub = github
    ? await fetchGitHubRepoDescription(github)
    : null;
  const defaultTagline =
    existing?.productTagLine ??
    taglineFromGitHub ??
    taglineFromFile ??
    "Modern Monorepo Starter";
  const productTagLine = await promptLine("Product tagline (PRODUCT_TAGLINE)", {
    defaultValue: defaultTagline,
  });

  const apexDefault =
    existing?.apexDomain && isValidApexDomain(existing.apexDomain)
      ? existing.apexDomain
      : undefined;

  const apexDomain = await promptOptionalApexDomain(apexDefault);

  const removeMitLicense = shouldOfferLicenseRemoval(github)
    ? (existing?.removeMitLicense ?? true)
    : existing?.removeMitLicense;

  const config = buildSetupConfig(
    productName,
    productTagLine,
    apexDomain,
    github,
    existing,
    removeMitLicense,
  );
  persistIdentityConfig(root, config);
  return config;
}
