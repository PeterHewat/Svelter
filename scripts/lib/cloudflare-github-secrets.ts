/* eslint-disable no-console -- CLI wizard */
import { resolveGitHubRepo } from "./apply-identity";
import {
  CloudflareApiError,
  findPagesProjectByName,
  formatCloudflareApiError,
} from "./cloudflare-api";
import {
  cloudflareApiTokenManualSteps,
  CLOUDFLARE_LOCAL_ENV,
  resolveCloudflareApiToken,
} from "./cloudflare-auth";
import {
  ensureGhProductionEnvironment,
  ghSecretSet,
  ghSecretSetEnv,
  isGhAuthenticated,
} from "./gh-secrets";
import { requireManualAction } from "./manual-action";
import type { SetupBootstrapOptions } from "./setup-args";
import { canAutomateGh, type SetupCliContext } from "./setup-cli";
import {
  markCloudflareGithubSecretsSynced,
  readSetupConfig,
  type CloudflareSetupMeta,
  type SetupConfig,
} from "./setup-config";
import { hasApexDomain } from "../../packages/config/validate-domain";

const CLOUDFLARE_DEPLOY_SECRETS = [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "CF_PAGES_PROJECT_WEB",
  "CF_PAGES_PROJECT_MARKETING",
] as const;

/**
 * Verifies a token can read the target Pages project in the given account.
 */
async function verifyCloudflareDeployToken(
  token: string,
  accountId: string,
  webProject: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const project = await findPagesProjectByName(token, accountId, webProject);
    if (!project) {
      return {
        ok: false,
        message: `Pages project "${webProject}" not found in account ${accountId}`,
      };
    }
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof CloudflareApiError
        ? formatCloudflareApiError(err)
        : String(err).slice(0, 200);
    return { ok: false, message };
  }
}

/**
 * Syncs Cloudflare deploy credentials to GitHub repository and production secrets.
 */
async function pushCloudflareDeploySecrets(
  root: string,
  token: string,
  accountId: string,
  meta: CloudflareSetupMeta,
): Promise<boolean> {
  const github = resolveGitHubRepo(root);
  const pairs: Array<[string, string]> = [
    ["CLOUDFLARE_API_TOKEN", token],
    ["CLOUDFLARE_ACCOUNT_ID", accountId],
    ["CF_PAGES_PROJECT_WEB", meta.projectNameWeb],
    ["CF_PAGES_PROJECT_MARKETING", meta.projectNameMarketing],
  ];

  let repoOkCount = 0;
  for (const [name, value] of pairs) {
    const ok = await ghSecretSet(root, name, value);
    console.log(ok ? `✓ ${name}` : `○ Failed to set ${name}`);
    if (ok) {
      repoOkCount += 1;
    }
  }

  let productionOkCount = 0;
  if (github) {
    const productionEnv = await ensureGhProductionEnvironment(root, github);
    if (!productionEnv.ok) {
      console.log(
        `○ Skip production Cloudflare secrets — ${productionEnv.message}`,
      );
    } else {
      for (const [name, value] of pairs) {
        const ok = await ghSecretSetEnv(root, "production", name, value);
        console.log(
          ok ? `✓ production / ${name}` : `○ Failed production / ${name}`,
        );
        if (ok) {
          productionOkCount += 1;
        }
      }
    }
  }

  return (
    repoOkCount === pairs.length &&
    (productionOkCount === pairs.length || !github)
  );
}

/**
 * Ensures durable Cloudflare deploy secrets exist in GitHub (repo + production).
 *
 * Staging reads repository secrets; release deploys read the production environment.
 *
 * @param root - Repository root
 * @param setup - Setup config snapshot (may be stale; disk is re-read)
 * @param cliContext - Optional CLI auth context
 * @param options - Bootstrap options (`forceResync` with `--sync-secrets`)
 */
export async function ensureCloudflareGithubSecretsSynced(
  root: string,
  setup: SetupConfig,
  cliContext?: SetupCliContext,
  options?: SetupBootstrapOptions,
): Promise<void> {
  const config = readSetupConfig(root) ?? setup;
  const meta = config.cloudflare;
  if (!meta?.synced) {
    return;
  }

  const alreadySynced = config.github?.syncedSecrets?.cloudflare;
  if (alreadySynced && !options?.forceResync) {
    return;
  }

  const ghReady = cliContext
    ? canAutomateGh(cliContext)
    : await isGhAuthenticated();
  if (!ghReady) {
    requireManualAction(
      "Authenticate GitHub CLI",
      [
        "Run `gh auth login -s repo,workflow` in a terminal",
        "Re-run `bun run setup` to sync Cloudflare deploy secrets",
      ],
      options,
    );
    return;
  }

  console.log("\nCloudflare GitHub secrets");
  if (options?.forceResync) {
    console.log("  Re-syncing deploy secrets (`--sync-secrets`).");
  } else if (!alreadySynced) {
    console.log(
      "  Syncing long-lived API token to repository secrets (staging) and production environment.",
    );
  }

  const resolved = await resolveCloudflareApiToken(root, {
    durableOnly: true,
    interactive: !options?.autoConfirm,
  });
  if (!resolved) {
    if (hasApexDomain(config.apexDomain)) {
      requireManualAction(
        "Provide a Cloudflare API token for CI deploys",
        [
          ...cloudflareApiTokenManualSteps(config.productName),
          "Re-run `bun run setup` after pasting the token",
        ],
        options,
      );
    } else {
      console.log("○ CLOUDFLARE_API_TOKEN required for Pages deploy workflows");
    }
    return;
  }
  if (resolved.source === "env") {
    console.log("✓ Cloudflare API token — CLOUDFLARE_API_TOKEN env");
  } else if (resolved.source === "local") {
    console.log(`✓ Cloudflare API token — ${CLOUDFLARE_LOCAL_ENV}`);
  } else {
    console.log("✓ Cloudflare API token — pasted for CI");
  }

  const verified = await verifyCloudflareDeployToken(
    resolved.token,
    meta.accountId,
    meta.projectNameWeb,
  );
  if (!verified.ok) {
    console.log(`○ Cloudflare token verification failed: ${verified.message}`);
    requireManualAction(
      "Fix Cloudflare API token permissions",
      [
        ...cloudflareApiTokenManualSteps(config.productName).filter((step) =>
          step.startsWith("Permissions"),
        ),
        `Account scope must include ${meta.accountId}`,
        `Pages project must exist: ${meta.projectNameWeb}`,
        "Re-run `bun run setup` after updating the token",
      ],
      options,
    );
    return;
  }
  console.log(
    `✓ Cloudflare token can access Pages project ${meta.projectNameWeb}`,
  );

  const allOk = await pushCloudflareDeploySecrets(
    root,
    resolved.token,
    meta.accountId,
    meta,
  );
  if (allOk && hasApexDomain(config.apexDomain)) {
    const github = resolveGitHubRepo(root);
    if (github) {
      const apexOk = await ghSecretSetEnv(
        root,
        "production",
        "APEX_DOMAIN",
        config.apexDomain!,
      );
      console.log(
        apexOk
          ? "✓ production / APEX_DOMAIN"
          : "○ Failed production / APEX_DOMAIN",
      );
    }
  }
  if (allOk) {
    markCloudflareGithubSecretsSynced(root);
    console.log(
      `✓ Cloudflare deploy secrets synced (${CLOUDFLARE_DEPLOY_SECRETS.join(", ")})`,
    );
  } else {
    requireManualAction(
      "Sync Cloudflare deploy secrets to GitHub",
      ["Fix GitHub secret sync failures above", "Re-run `bun run setup`"],
      options,
    );
  }
}
