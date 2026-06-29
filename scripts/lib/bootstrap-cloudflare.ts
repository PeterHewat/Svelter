/* eslint-disable no-console -- CLI wizard */
import { deriveProductionHostnames } from "../../packages/config/hostnames";
import { hasApexDomain } from "../../packages/config/validate-domain";
import {
  CloudflareApiError,
  ensurePagesProject,
  ensurePagesProjectDomain,
  ensureZone,
  formatCloudflareApiError,
  type CloudflareZone,
} from "./cloudflare-api";
import { pagesProjectNames } from "./hosting-project-spec";
import { printManualAction, exitWithManualAction } from "./manual-action";
import {
  CLOUDFLARE_DASHBOARD,
  cloudflarePagesProjectUrl,
  cloudflareZoneDnsUrl,
} from "./platform-urls";
import {
  registrarNameserverManualSteps,
  resolveCloudflareApiToken,
  resolveWranglerAccountId,
} from "./cloudflare-auth";
import {
  syncApexDnsRecords,
  trySyncApexDnsToCloudflare,
} from "./cloudflare-apex-dns";
import { readClerkProductionSecretKey } from "./clerk-web-env";
import { ensureCloudflareGithubSecretsSynced } from "./cloudflare-github-secrets";
import { productNameToSlug, type GitHubRepo } from "./repo-identity";
import type { SetupBootstrapOptions } from "./setup-args";
import type { SetupCliContext } from "./setup-cli";
import {
  markCloudflareDnsConfigured,
  markCloudflareSynced,
  type CloudflareSetupMeta,
  type SetupConfig,
} from "./setup-config";
import { promptConfirm, promptLine } from "./prompt";

/**
 * Resolves Cloudflare account ID (saved meta, Wrangler, API, or prompt).
 */
async function resolveAccountId(
  root: string,
  token: string,
  existing?: string,
): Promise<string | null> {
  if (existing?.trim()) {
    return existing.trim();
  }
  const fromWrangler = await resolveWranglerAccountId(root, token);
  if (fromWrangler) {
    console.log(`✓ Cloudflare account ID — ${fromWrangler}`);
    return fromWrangler;
  }
  printManualAction("Find your Cloudflare account ID", [
    `Dashboard → Workers & Pages: ${CLOUDFLARE_DASHBOARD}`,
    "Account ID is in the URL or Overview sidebar",
  ]);
  const raw = await promptLine("CLOUDFLARE_ACCOUNT_ID", { required: true });
  const trimmed = raw.trim();
  return trimmed || null;
}

/**
 * Prints Cloudflare nameservers for registrar delegation.
 *
 * @param zone - Cloudflare zone
 */
function printRegistrarNameserverInstructions(zone: CloudflareZone): void {
  console.log("\nDNS — point your registrar at Cloudflare nameservers");
  console.log(`  Zone: ${zone.name} (status: ${zone.status})`);
  for (const ns of zone.name_servers) {
    console.log(`  Nameserver: ${ns}`);
  }
  printManualAction("Update nameservers at your domain registrar", [
    ...registrarNameserverManualSteps(zone.name_servers),
    `Cloudflare DNS records: ${cloudflareZoneDnsUrl(zone.name)}`,
  ]);
}

/**
 * Blocks setup until the user confirms registrar nameservers point to Cloudflare.
 *
 * @param root - Repository root
 * @param zone - Cloudflare zone with assigned nameservers
 */
async function awaitRegistrarNameservers(
  root: string,
  zone: CloudflareZone,
  options?: SetupBootstrapOptions,
): Promise<void> {
  printRegistrarNameserverInstructions(zone);
  if (options?.autoConfirm) {
    printManualAction("Point registrar nameservers to Cloudflare", [
      ...registrarNameserverManualSteps(zone.name_servers),
    ]);
    return;
  }
  const ready = await promptConfirm(
    "Nameservers updated at your registrar? (continue only after you have switched DNS to Cloudflare)",
    { defaultYes: false },
  );
  if (!ready) {
    exitWithManualAction("Point registrar nameservers to Cloudflare", [
      ...registrarNameserverManualSteps(zone.name_servers),
    ]);
  }
  markCloudflareDnsConfigured(root);
  console.log("✓ Registrar nameserver delegation confirmed");
}

/**
 * Ensures zone and production Pages custom domains (apex + www).
 */
async function configureApexHosting(
  root: string,
  token: string,
  accountId: string,
  apex: string,
  webProject: string,
  marketingProject: string,
): Promise<{ zone: CloudflareZone | null; ok: boolean }> {
  const hostnames = deriveProductionHostnames(apex);

  let zone: CloudflareZone;
  try {
    zone = await ensureZone(token, accountId, apex);
    console.log(`✓ Cloudflare zone ${zone.name}`);
  } catch (err) {
    const detail =
      err instanceof CloudflareApiError
        ? formatCloudflareApiError(err)
        : String(err).slice(0, 120);
    printManualAction(`Add ${apex} as a Cloudflare zone`, [
      CLOUDFLARE_DASHBOARD,
      "Domains → Add a domain → enter apex domain → choose Free plan",
      `API error: ${detail}`,
      "API alternative: custom token with Account Settings Edit + Zone Edit — see setup Cloudflare token checklist",
      "`wrangler login` can create Pages projects but cannot create DNS zones",
    ]);
    return { zone: null, ok: false };
  }

  await syncApexDnsRecords(
    root,
    token,
    accountId,
    zone.name,
    webProject,
    marketingProject,
    readClerkProductionSecretKey(root),
  );

  let ok = true;
  const webDomains = [hostnames.webProduction];
  for (const domain of webDomains) {
    try {
      await ensurePagesProjectDomain(token, accountId, webProject, domain);
      console.log(`✓ Pages domain ${domain} → ${webProject}`);
    } catch (err) {
      ok = false;
      const detail =
        err instanceof CloudflareApiError
          ? formatCloudflareApiError(err)
          : String(err).slice(0, 120);
      printManualAction(`Attach ${domain} to Pages project ${webProject}`, [
        cloudflarePagesProjectUrl(accountId, webProject),
        `API error: ${detail}`,
      ]);
    }
  }

  const marketingDomains = [hostnames.marketingProduction];
  for (const domain of marketingDomains) {
    try {
      await ensurePagesProjectDomain(
        token,
        accountId,
        marketingProject,
        domain,
      );
      console.log(`✓ Pages domain ${domain} → ${marketingProject}`);
    } catch (err) {
      ok = false;
      const detail =
        err instanceof CloudflareApiError
          ? formatCloudflareApiError(err)
          : String(err).slice(0, 120);
      printManualAction(
        `Attach ${domain} to Pages project ${marketingProject}`,
        [
          cloudflarePagesProjectUrl(accountId, marketingProject),
          `API error: ${detail}`,
        ],
      );
    }
  }

  return { zone, ok };
}

/**
 * Interactive Cloudflare Pages bootstrap: projects, domains, GitHub secrets.
 *
 * @param root - Repository root
 * @param setup - Persisted setup config
 * @param github - Parsed GitHub remote, if any
 * @param cliContext - Optional CLI auth context
 */
export async function bootstrapCloudflare(
  root: string,
  setup: SetupConfig,
  github: GitHubRepo | null,
  cliContext?: SetupCliContext,
  options?: SetupBootstrapOptions,
): Promise<void> {
  void github;
  const hasApex = hasApexDomain(setup.apexDomain);
  const cloudflareSynced = setup.cloudflare?.synced;
  const dnsConfigured = setup.cloudflare?.dnsConfigured;

  if (cloudflareSynced && (dnsConfigured || !hasApex)) {
    console.log("\nCloudflare Pages");
    console.log("✓ Cloudflare already configured — skip");
    if (hasApex && setup.apexDomain) {
      await trySyncApexDnsToCloudflare(root, setup);
    }
    await ensureCloudflareGithubSecretsSynced(root, setup, cliContext, options);
    return;
  }

  const resolved = await resolveCloudflareApiToken(root);
  if (!resolved) {
    console.log("○ CLOUDFLARE_API_TOKEN required");
    return;
  }
  const token = resolved.token;
  if (resolved.source === "env") {
    console.log("✓ Cloudflare API token — CLOUDFLARE_API_TOKEN env");
  }
  if (hasApex && resolved.source === "wrangler_oauth") {
    console.log(
      "  `wrangler login` works for Pages — use Dashboard → Add a domain (or a long-lived API token) to create the DNS zone",
    );
  }

  const accountId =
    setup.cloudflare?.accountId ?? (await resolveAccountId(root, token));
  if (!accountId) {
    console.log("○ CLOUDFLARE_ACCOUNT_ID required");
    return;
  }

  if (cloudflareSynced && !dnsConfigured && hasApex) {
    console.log("\nCloudflare Pages");
    console.log("  Resume — confirm registrar nameservers for your apex zone.");
    const meta = setup.cloudflare!;
    const { zone } = await configureApexHosting(
      root,
      token,
      accountId,
      setup.apexDomain!,
      meta.projectNameWeb,
      meta.projectNameMarketing,
    );
    if (zone) {
      await awaitRegistrarNameservers(root, zone, options);
    }
    await ensureCloudflareGithubSecretsSynced(root, setup, cliContext, options);
    return;
  }

  const firstSetup = !cloudflareSynced;

  console.log("\nCloudflare Pages");
  console.log(
    "  Automates: direct-upload Pages projects, zone + production custom domains, GitHub secrets.",
  );
  console.log(
    "  Manual only: point your registrar nameservers at Cloudflare (explicit confirmation).",
  );

  const proceed = options?.autoConfirm
    ? true
    : await promptConfirm("Set up Cloudflare Pages for web and marketing?", {
        defaultYes: firstSetup,
      });
  if (!proceed) {
    console.log(
      "○ Skipped — docs/environments.md#cloudflare-pages-web--marketing",
    );
    return;
  }

  const names = pagesProjectNames(productNameToSlug(setup.productName));

  let webProject;
  let marketingProject;
  try {
    webProject = await ensurePagesProject(token, accountId, names.web);
    console.log(`✓ Pages project ${webProject.name}`);
    marketingProject = await ensurePagesProject(
      token,
      accountId,
      names.marketing,
    );
    console.log(`✓ Pages project ${marketingProject.name}`);
  } catch (err) {
    const detail =
      err instanceof CloudflareApiError
        ? formatCloudflareApiError(err)
        : String(err).slice(0, 120);
    printManualAction("Create Cloudflare Pages projects manually", [
      CLOUDFLARE_DASHBOARD,
      `Create direct-upload projects: ${names.web}, ${names.marketing} (no Git link)`,
      `API error: ${detail}`,
    ]);
    return;
  }

  const meta: CloudflareSetupMeta = {
    accountId,
    projectNameWeb: webProject.name,
    projectNameMarketing: marketingProject.name,
  };
  markCloudflareSynced(root, meta);

  if (hasApex) {
    const { zone, ok } = await configureApexHosting(
      root,
      token,
      accountId,
      setup.apexDomain!,
      webProject.name,
      marketingProject.name,
    );
    await ensureCloudflareGithubSecretsSynced(root, setup, cliContext, options);
    if (zone) {
      await awaitRegistrarNameservers(root, zone, options);
    }
    if (!ok) {
      printManualAction("Fix Cloudflare hosting setup before go-live", [
        `Web: ${cloudflarePagesProjectUrl(accountId, webProject.name)}`,
        `Marketing: ${cloudflarePagesProjectUrl(accountId, marketingProject.name)}`,
        "Re-run `bun run setup` after fixing API errors above",
      ]);
    }
  } else {
    console.log("\n○ Custom domains deferred — no apex domain in setup");
    console.log(
      "  Projects use default *.pages.dev URLs until you add a domain and re-run setup",
    );
    await ensureCloudflareGithubSecretsSynced(root, setup, cliContext, options);
  }
}
