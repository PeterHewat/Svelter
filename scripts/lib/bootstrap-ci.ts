/* eslint-disable no-console -- CLI wizard */
import { isPlaceholderE2eEmail } from "../../packages/config/e2e-auth";
import { isPlaceholderEnvValue } from "../../packages/config/env-placeholders";
import { resolveGitHubRepo } from "./apply-identity";
import { ensureClerkConvexJwtTemplate } from "./clerk-jwt-template";
import { resolveDevConvexDeployKey } from "./convex-deploy-key";
import { isConvexLinked } from "./convex-link";
import { readEnvFile } from "./env-file";
import {
  ghSecretSet,
  isGhAuthenticated,
  listGhRepoSecrets,
} from "./gh-secrets";
import { requireManualAction } from "./manual-action";
import { canAutomateGh, type SetupCliContext } from "./setup-cli";
import { githubEnvironmentsUrl, githubSecretsUrl } from "./platform-urls";
import { promptConfirm } from "./prompt";
import type { SetupBootstrapOptions } from "./setup-args";
import { logSetupStackSection } from "./setup-stack-labels";
import { markGithubSecretsSynced, type SetupConfig } from "./setup-config";

const WEB_ENV = "apps/web/.env.local";

const REPO_ENV_SECRETS = [
  "PUBLIC_CONVEX_URL",
  "PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "E2E_USER_EMAIL",
] as const;

type RepoEnvSecret = (typeof REPO_ENV_SECRETS)[number];

function isLocalRepoSecretReady(
  name: RepoEnvSecret,
  value: string | undefined,
): boolean {
  if (!value) {
    return false;
  }
  if (name === "E2E_USER_EMAIL") {
    return !isPlaceholderE2eEmail(value);
  }
  return !isPlaceholderEnvValue(value);
}

/**
 * Pushes dev-stack repository secrets to GitHub when the user confirms.
 */
export async function bootstrapCiSecrets(
  root: string,
  setup: SetupConfig,
  cliContext?: SetupCliContext,
  options?: SetupBootstrapOptions,
): Promise<void> {
  const github = resolveGitHubRepo(root);
  const webEnv = readEnvFile(root, WEB_ENV);
  const remoteSecrets = new Set(await listGhRepoSecrets(root));
  const missingOnGitHub = REPO_ENV_SECRETS.filter(
    (name) =>
      isLocalRepoSecretReady(name, webEnv[name]) && !remoteSecrets.has(name),
  );
  const needsDeployKey = !remoteSecrets.has("CONVEX_DEPLOY_KEY");
  const firstSync = !setup.github?.syncedSecrets?.repo;
  const needsSync = firstSync || needsDeployKey || missingOnGitHub.length > 0;

  if (!needsSync) {
    logSetupStackSection(
      "development",
      "GitHub Actions",
      "Repository secrets — skip (already synced)",
    );
    console.log("✓ Dev CI secrets already synced — skip");
    return;
  }

  const ghReady = cliContext
    ? canAutomateGh(cliContext)
    : await isGhAuthenticated();

  logSetupStackSection(
    "development",
    "GitHub Actions",
    "Repository secrets for PR CI, Playwright E2E, and merge-to-main staging (pk_test_ / Convex dev)",
  );
  if (!firstSync && missingOnGitHub.length > 0) {
    console.log(`  Missing on GitHub: ${missingOnGitHub.join(", ")}`);
  }
  console.log(
    "  Syncs dev **repository** secrets for PR CI and Playwright (development Convex + Clerk only).",
  );
  console.log(
    "  Automatic when you answer yes below and `gh auth login` is done — no manual paste in GitHub UI.",
  );
  console.log(
    "  Includes a newly minted CONVEX_DEPLOY_KEY (CI codegen); existing GitHub key is replaced.",
  );
  if (github) {
    console.log(`  Manual fallback: ${githubSecretsUrl(github)}`);
  }

  const proceed = options?.autoConfirm
    ? needsSync && ghReady
    : await promptConfirm("Sync dev CI secrets to GitHub?", {
        defaultYes: needsSync && ghReady,
      });
  if (!proceed) {
    console.log("○ Skipped — docs/ci-cd.md#repository-secrets");
    return;
  }

  if (!ghReady) {
    if (github) {
      console.log(`  Manual fallback: ${githubSecretsUrl(github)}`);
      console.log(`  Environments: ${githubEnvironmentsUrl(github)}`);
    }
    requireManualAction(
      "Authenticate GitHub CLI",
      [
        "Install from https://cli.github.com/",
        "Run `gh auth login -s repo,workflow`",
        "Resume `bun run setup`",
      ],
      options,
    );
    return;
  }

  if (!isConvexLinked(root)) {
    requireManualAction(
      "Link Convex before syncing CI secrets",
      ["Resume `bun run setup` — complete the Convex + Clerk step first"],
      options,
    );
    return;
  }

  const clerkSecret = webEnv.CLERK_SECRET_KEY?.trim();
  if (clerkSecret?.startsWith("sk_test_")) {
    const jwtTemplate = await ensureClerkConvexJwtTemplate(clerkSecret);
    if (jwtTemplate.ok && jwtTemplate.created) {
      console.log(
        '✓ Created Clerk JWT template "convex" (Convex + Clerk auth)',
      );
    } else if (!jwtTemplate.ok) {
      console.log(`○ Clerk JWT template "convex": ${jwtTemplate.message}`);
    }
  }

  let allSecretsOk = true;
  let deployKeyOk = !needsDeployKey || remoteSecrets.has("CONVEX_DEPLOY_KEY");
  if (firstSync || needsDeployKey) {
    const deployKey = await resolveDevConvexDeployKey(root, "github-ci");
    if (!deployKey) {
      requireManualAction(
        "Mint CONVEX_DEPLOY_KEY for CI",
        ["Resume `bun run setup` after linking Convex"],
        options,
      );
      return;
    }
    deployKeyOk = await ghSecretSet(root, "CONVEX_DEPLOY_KEY", deployKey);
    console.log(
      deployKeyOk ? "✓ CONVEX_DEPLOY_KEY" : "○ Failed CONVEX_DEPLOY_KEY",
    );
    if (!deployKeyOk) {
      allSecretsOk = false;
    }
  }

  for (const name of REPO_ENV_SECRETS) {
    const value = webEnv[name];
    if (!isLocalRepoSecretReady(name, value)) {
      console.log(`○ Skip ${name} — not set in ${WEB_ENV}`);
      continue;
    }
    if (
      !firstSync &&
      remoteSecrets.has(name) &&
      !missingOnGitHub.includes(name)
    ) {
      continue;
    }
    const ok = await ghSecretSet(root, name, value!);
    console.log(ok ? `✓ ${name}` : `○ Failed to set ${name}`);
    if (!ok) {
      allSecretsOk = false;
    }
  }

  const updatedRemoteSecrets = new Set(await listGhRepoSecrets(root));
  const stillMissing = REPO_ENV_SECRETS.filter(
    (name) =>
      isLocalRepoSecretReady(name, webEnv[name]) &&
      !updatedRemoteSecrets.has(name),
  );

  if (deployKeyOk && allSecretsOk && stillMissing.length === 0) {
    markGithubSecretsSynced(root);
  } else if (!allSecretsOk || stillMissing.length > 0) {
    console.log(
      "○ repo secrets not marked synced — fix failures above and resume setup",
    );
    if (stillMissing.length > 0) {
      console.log(`○ Still missing on GitHub: ${stillMissing.join(", ")}`);
    }
  }
}
