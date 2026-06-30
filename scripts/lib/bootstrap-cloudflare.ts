/* eslint-disable no-console -- CLI wizard */
import { deriveProductionHostnames } from "../../packages/config/hostnames";
import { hasApexDomain } from "../../packages/config/validate-domain";
import {
  CloudflareApiError,
  ensurePagesProject,
  ensurePagesProjectDomain,
  ensureZone,
  findZoneByName,
  formatCloudflareApiError,
  type CloudflareZone,
} from "./cloudflare-api";
import {
  cloudflareApexDnsAutomationFailedSteps,
  cloudflarePagesCustomDomainManualSteps,
} from "./cloudflare-manual-steps";
import {
  printManualAction,
  requireManualAction,
  exitWithManualAction,
} from "./manual-action";
import { CLOUDFLARE_DASHBOARD, cloudflareZoneDnsUrl } from "./platform-urls";
import { openUrlInBrowser } from "./open-url";
import {
  registrarNameserverManualSteps,
  resolveCloudflareApiToken,
  CLOUDFLARE_LOCAL_ENV,
  resolveWranglerAccountId,
  type ResolvedCloudflareToken,
} from "./cloudflare-auth";
import {
  syncApexDnsForHosting,
  trySyncApexDnsToCloudflare,
} from "./cloudflare-apex-dns";
import { readClerkProductionSecretKey } from "./clerk-web-env";
import { ensureCloudflareGithubSecretsSynced } from "./cloudflare-github-secrets";
import { pagesProjectNames } from "./hosting-project-spec";
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
import { logSetupStackSection } from "./setup-stack-labels";

export type BootstrapCloudflareResult = "complete" | "skipped" | "blocked";

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
    `Open ${CLOUDFLARE_DASHBOARD}`,
    "Go to **Workers & Pages** → select your account",
    "Copy **Account ID** from the URL (`/…/accounts/<id>/…`) or the right sidebar",
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

function apexZoneManualSteps(apex: string, detail?: string): string[] {
  return [
    `Open ${CLOUDFLARE_DASHBOARD}`,
    `Go to **Domains** → **Add a domain** → enter **${apex}** → choose **Free** plan → **Continue**`,
    ...(detail ? [`API error: ${detail}`] : []),
    "API alternative: custom token with Account Settings Edit + Zone Edit — see setup Cloudflare token checklist",
    "`wrangler login` can create Pages projects but cannot create DNS zones",
    `Re-run \`bun run setup\` after ${apex} appears in Cloudflare`,
  ];
}

/**
 * Creates or finds the apex zone, retrying with a durable API token and dashboard confirmation.
 */
async function resolveApexCloudflareZone(
  root: string,
  resolved: ResolvedCloudflareToken,
  accountId: string,
  apex: string,
  options?: SetupBootstrapOptions,
): Promise<{ zone: CloudflareZone; token: ResolvedCloudflareToken }> {
  let token = resolved;

  const lookupOrCreate = async (): Promise<CloudflareZone | null> => {
    try {
      return await ensureZone(token.token, accountId, apex);
    } catch {
      const existing = await findZoneByName(token.token, apex);
      if (existing) {
        return existing;
      }
      return null;
    }
  };

  let zone = await lookupOrCreate();
  if (zone) {
    console.log(`✓ Cloudflare zone ${zone.name}`);
    return { zone, token };
  }

  let lastDetail = "";
  try {
    await ensureZone(token.token, accountId, apex);
  } catch (err) {
    lastDetail =
      err instanceof CloudflareApiError
        ? formatCloudflareApiError(err)
        : String(err).slice(0, 120);
  }

  if (
    token.source === "wrangler_oauth" &&
    !options?.autoConfirm &&
    Boolean(process.stdin.isTTY)
  ) {
    console.log(
      "○ Cloudflare zone not found — `wrangler login` cannot create DNS zones",
    );
    console.log(
      "  Paste a long-lived API token (Account Settings Edit + Zone Edit) or add the zone in the dashboard",
    );
    const durable = await resolveCloudflareApiToken(root, {
      durableOnly: true,
      interactive: true,
    });
    if (durable) {
      token = durable;
      zone = await lookupOrCreate();
      if (zone) {
        console.log(`✓ Cloudflare zone ${zone.name}`);
        return { zone, token };
      }
    }
  }

  const interactive = Boolean(process.stdin.isTTY) && !options?.autoConfirm;
  if (interactive) {
    while (!zone) {
      printManualAction(
        `Add ${apex} as a Cloudflare zone`,
        apexZoneManualSteps(apex, lastDetail),
        {
          immediate: true,
        },
      );
      await openUrlInBrowser(CLOUDFLARE_DASHBOARD);
      const retry = await promptConfirm(
        "Created the zone in Cloudflare? (setup will look it up now)",
        { defaultYes: false },
      );
      if (!retry) {
        requireManualAction(
          `Add ${apex} as a Cloudflare zone`,
          apexZoneManualSteps(apex, lastDetail),
          options,
        );
      }
      zone = await findZoneByName(token.token, apex);
      if (zone) {
        console.log(`✓ Cloudflare zone ${zone.name}`);
        return { zone, token };
      }
      console.log(
        "○ Zone still not visible — confirm the domain is on this Cloudflare account and token has Zone Read",
      );
      lastDetail = "Zone not found after dashboard lookup";
    }
  }

  requireManualAction(
    `Add ${apex} as a Cloudflare zone`,
    apexZoneManualSteps(apex, lastDetail),
    options,
  );
  throw new Error("unreachable");
}

/**
 * Ensures zone and production Pages custom domains (apex + www).
 */
async function configureApexHosting(
  root: string,
  resolved: ResolvedCloudflareToken,
  accountId: string,
  apex: string,
  webProject: string,
  marketingProject: string,
  options?: SetupBootstrapOptions,
): Promise<{
  zone: CloudflareZone;
  token: ResolvedCloudflareToken;
  ok: boolean;
}> {
  const hostnames = deriveProductionHostnames(apex);
  const { zone, token } = await resolveApexCloudflareZone(
    root,
    resolved,
    accountId,
    apex,
    options,
  );

  const dnsOk = await syncApexDnsForHosting(
    root,
    { token: token.token, source: token.source },
    accountId,
    zone.name,
    webProject,
    marketingProject,
    readClerkProductionSecretKey(root),
  );

  let ok = dnsOk;
  const webDomains = [hostnames.webProduction];
  for (const domain of webDomains) {
    try {
      await ensurePagesProjectDomain(
        token.token,
        accountId,
        webProject,
        domain,
      );
      console.log(`✓ Pages domain ${domain} → ${webProject}`);
    } catch (err) {
      ok = false;
      const detail =
        err instanceof CloudflareApiError
          ? formatCloudflareApiError(err)
          : String(err).slice(0, 120);
      requireManualAction(
        `Attach ${domain} to Pages project ${webProject}`,
        [
          ...cloudflarePagesCustomDomainManualSteps(
            accountId,
            webProject,
            marketingProject,
            apex,
          ),
          `API error: ${detail}`,
          "Re-run `bun run setup` after custom domains show Active in Cloudflare Pages",
        ],
        options,
      );
    }
  }

  const marketingDomains = [hostnames.marketingProduction];
  for (const domain of marketingDomains) {
    try {
      await ensurePagesProjectDomain(
        token.token,
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
      requireManualAction(
        `Attach ${domain} to Pages project ${marketingProject}`,
        [
          ...cloudflarePagesCustomDomainManualSteps(
            accountId,
            webProject,
            marketingProject,
            apex,
          ),
          `API error: ${detail}`,
          "Re-run `bun run setup` after custom domains show Active in Cloudflare Pages",
        ],
        options,
      );
    }
  }

  if (!ok) {
    requireManualAction(
      "Finish Cloudflare DNS for your apex domain",
      cloudflareApexDnsAutomationFailedSteps(
        apex,
        accountId,
        webProject,
        marketingProject,
      ),
      options,
    );
  }

  return { zone, token, ok };
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
): Promise<BootstrapCloudflareResult> {
  if (!github) {
    requireManualAction(
      "Add a GitHub remote",
      [
        "Create a repository from this template on GitHub and set `git remote add origin …`",
        "Re-run `bun run setup`",
      ],
      options,
    );
    return "blocked";
  }

  const hasApex = hasApexDomain(setup.apexDomain);
  const cloudflareSynced = setup.cloudflare?.synced;
  const dnsConfigured = setup.cloudflare?.dnsConfigured;

  if (cloudflareSynced && (dnsConfigured || !hasApex)) {
    logSetupStackSection(
      "production",
      "Cloudflare Pages",
      "Skip — already configured",
    );
    console.log("✓ Cloudflare already configured — skip");
    if (hasApex && setup.apexDomain) {
      await trySyncApexDnsToCloudflare(root, setup);
    }
    await ensureCloudflareGithubSecretsSynced(root, setup, cliContext, options);
    return "complete";
  }

  const resolved = await resolveCloudflareApiToken(root);
  if (!resolved) {
    requireManualAction(
      "Provide a Cloudflare API token",
      [
        CLOUDFLARE_DASHBOARD,
        "Create a custom token with Account Pages Edit + Zone Edit + DNS Edit",
        "Export CLOUDFLARE_API_TOKEN or paste when setup prompts",
        "Re-run `bun run setup`",
      ],
      options,
    );
    return "blocked";
  }
  const token = resolved.token;
  if (resolved.source === "env") {
    console.log("✓ Cloudflare API token — CLOUDFLARE_API_TOKEN env");
  } else if (resolved.source === "local") {
    console.log(`✓ Cloudflare API token — ${CLOUDFLARE_LOCAL_ENV}`);
  }
  if (hasApex && resolved.source === "wrangler_oauth") {
    console.log(
      "  `wrangler login` works for Pages — paste a long-lived API token when prompted for DNS zones",
    );
  }

  const accountId =
    setup.cloudflare?.accountId ?? (await resolveAccountId(root, token));
  if (!accountId) {
    requireManualAction(
      "Set CLOUDFLARE_ACCOUNT_ID",
      [
        `Dashboard: ${CLOUDFLARE_DASHBOARD}`,
        "Copy account ID from Workers & Pages overview",
        "Re-run `bun run setup`",
      ],
      options,
    );
    return "blocked";
  }

  if (cloudflareSynced && !dnsConfigured && hasApex) {
    logSetupStackSection(
      "production",
      "Cloudflare Pages",
      "Resume apex zone, automated DNS, and registrar nameservers",
    );
    console.log("  Resume — finish apex zone, DNS, and registrar nameservers.");
    const meta = setup.cloudflare!;
    const hosting = await configureApexHosting(
      root,
      resolved,
      accountId,
      setup.apexDomain!,
      meta.projectNameWeb,
      meta.projectNameMarketing,
      options,
    );
    await ensureCloudflareGithubSecretsSynced(root, setup, cliContext, options);
    await awaitRegistrarNameservers(root, hosting.zone, options);
    return "complete";
  }

  logSetupStackSection(
    "production",
    "Cloudflare Pages",
    "Pages projects · apex DNS (automatic) · GitHub deploy secrets for release-* and staging repo secrets",
  );
  console.log(
    "  Automates: direct-upload Pages projects, zone + production custom domains, GitHub secrets.",
  );
  console.log(
    "  Manual only: point your registrar nameservers at Cloudflare (explicit confirmation).",
  );

  const proceed = options?.autoConfirm
    ? true
    : await promptConfirm("Set up Cloudflare Pages for web and marketing?", {
        defaultYes: true,
      });
  if (!proceed) {
    requireManualAction(
      "Set up Cloudflare Pages",
      [
        "This template requires Cloudflare Pages for staging (`main`) and production (`release-*`) deploys",
        "Re-run `bun run setup` and confirm the Cloudflare step",
        "docs/environments.md#cloudflare-pages-web--marketing",
      ],
      options,
    );
    return "blocked";
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
    requireManualAction(
      "Create Cloudflare Pages projects manually",
      [
        CLOUDFLARE_DASHBOARD,
        `Create direct-upload projects: ${names.web}, ${names.marketing} (no Git link)`,
        `API error: ${detail}`,
        "Re-run `bun run setup` after both projects exist",
      ],
      options,
    );
    return "blocked";
  }

  const meta: CloudflareSetupMeta = {
    accountId,
    projectNameWeb: webProject.name,
    projectNameMarketing: marketingProject.name,
  };
  markCloudflareSynced(root, meta);

  if (hasApex) {
    const hosting = await configureApexHosting(
      root,
      resolved,
      accountId,
      setup.apexDomain!,
      webProject.name,
      marketingProject.name,
      options,
    );
    await ensureCloudflareGithubSecretsSynced(root, setup, cliContext, options);
    await awaitRegistrarNameservers(root, hosting.zone, options);
  } else {
    console.log("\n○ Custom domains deferred — no apex domain in setup");
    console.log(
      "  Projects use default *.pages.dev URLs until you add a domain and re-run setup",
    );
    await ensureCloudflareGithubSecretsSynced(root, setup, cliContext, options);
  }

  return "complete";
}
