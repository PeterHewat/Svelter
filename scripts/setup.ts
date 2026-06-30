#!/usr/bin/env bun
/* eslint-disable no-console -- CLI output */
/**
 * Setup and readiness — safe to re-run anytime.
 *
 * @example
 * bun run setup
 * bun run setup -- --sync-secrets
 */
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { ensureAgentLinks } from "./lib/agent-links";
import {
  clerkSkillsInstallCommand,
  cloudflareSkillsInstallCommand,
  runClerkAgentSkillsIfNeeded,
  runCloudflareAgentSkillsIfNeeded,
  runConvexAgentSkillsIfNeeded,
} from "./lib/agent-skills";
import { applyIdentity, resolveGitHubRepo } from "./lib/apply-identity";
import { applyLicenseFromConfig } from "./lib/license-identity";
import { applyReadmeIdentity } from "./lib/readme-identity";
import { TEMPLATE_PRODUCT_NAME } from "./lib/repo-identity";
import { bootstrapCiSecrets } from "./lib/bootstrap-ci";
import { bootstrapGithubLabels } from "./lib/bootstrap-github-labels";
import { bootstrapConvexClerk } from "./lib/bootstrap-convex-clerk";
import { bootstrapProduction } from "./lib/bootstrap-production";
import { bootstrapCloudflare } from "./lib/bootstrap-cloudflare";
import { hasApexDomain } from "../packages/config/validate-domain";
import { isConvexLinked } from "./lib/convex-link";
import { runIdentityWizard } from "./lib/prompt-identity";
import { runReadiness } from "./lib/readiness";
import { parseSetupFlags } from "./lib/setup-args";
import { readSetupConfig } from "./lib/setup-config";
import { printSetupStackSummary } from "./lib/setup-stack-labels";
import {
  runSetupCliPrerequisites,
  type SetupCliContext,
} from "./lib/setup-cli";

const root = resolve(import.meta.dir, "..");

/**
 * Copies `src` to `dest` when `dest` is missing.
 *
 * @returns Whether a new file was created
 */
function copyTemplateIfMissing(src: string, dest: string): boolean {
  const absSrc = resolve(root, src);
  const absDest = resolve(root, dest);
  if (existsSync(absDest)) {
    return false;
  }
  if (!existsSync(absSrc)) {
    console.warn(`○ Skip ${dest}: template ${src} not found`);
    return false;
  }
  copyFileSync(absSrc, absDest);
  console.log(`✓ Created ${dest} from ${src}`);
  return true;
}

/**
 * Runs `bun scripts/generate.ts` from the repo root.
 *
 * @returns Process exit code (0 = success)
 */
async function runGenerate(): Promise<number> {
  console.log("\n→ bun scripts/generate.ts");
  const proc = Bun.spawn(["bun", "scripts/generate.ts"], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  return (await proc.exited) ?? 1;
}

async function main(): Promise<void> {
  const flags = parseSetupFlags();
  const interactive = Boolean(process.stdin.isTTY);

  console.log("Svelter setup\n");

  if (flags.syncSecrets) {
    console.log(
      "○ Non-interactive secret sync (`--sync-secrets`) — skips prompts where automation is ready\n",
    );
  }

  ensureAgentLinks(root);

  let cliContext: SetupCliContext | undefined;
  if (interactive) {
    cliContext = await runSetupCliPrerequisites(root);
    console.log("");
  }

  copyTemplateIfMissing("apps/web/.env.example", "apps/web/.env.local");

  const github = resolveGitHubRepo(root);

  const setupConfig = interactive
    ? await runIdentityWizard(root, github)
    : readSetupConfig(root);

  if (!setupConfig && !interactive) {
    console.log(
      "○ No .svelter/setup.json — run setup interactively once to configure identity",
    );
  }

  if (github && setupConfig) {
    const identity = applyIdentity(root, github);
    console.log(
      `✓ Repository: ${github.repoUrl} → product name "${identity.productName}"${identity.rebranded ? "" : " (upstream template)"}`,
    );
    if (identity.changes.length > 0) {
      console.log(`✓ Updated: ${identity.changes.join(", ")}`);
    }
  } else if (github && !setupConfig) {
    const identity = applyIdentity(root, github);
    console.log(
      `✓ Repository: ${github.repoUrl} → product name "${identity.productName}"${identity.rebranded ? "" : " (upstream template)"}`,
    );
  } else if (!setupConfig) {
    console.log(
      "○ No GitHub remote — product name stays at template default until you add origin",
    );
  } else {
    const readmeUpdated =
      setupConfig.productName !== TEMPLATE_PRODUCT_NAME &&
      applyReadmeIdentity(root, setupConfig.productName);
    const licenseUpdated = applyLicenseFromConfig(root, setupConfig, null);
    if (readmeUpdated) {
      console.log("✓ Updated README.md");
    }
    if (licenseUpdated) {
      console.log("✓ Updated LICENSE and package.json (license)");
    }
  }

  if (setupConfig) {
    await bootstrapConvexClerk(root, setupConfig, interactive, cliContext);
  }

  const generateCode = await runGenerate();
  if (generateCode !== 0 && isConvexLinked(root)) {
    console.error(
      "\nSetup incomplete — `bun scripts/generate.ts` failed while Convex is linked. Fix errors above, then re-run `bun run setup`.",
    );
    process.exit(generateCode);
  }

  const convexSkillsCode = await runConvexAgentSkillsIfNeeded(root);
  if (convexSkillsCode !== 0) {
    console.warn(
      "○ Convex agent skills install/update failed (optional). Retry: bunx convex ai-files update",
    );
  }

  const clerkSkillsCode = await runClerkAgentSkillsIfNeeded(root);
  if (clerkSkillsCode !== 0) {
    console.warn(
      `○ Clerk agent skills not installed (optional). Retry: ${clerkSkillsInstallCommand()}`,
    );
  }

  const cloudflareSkillsCode = await runCloudflareAgentSkillsIfNeeded(root);
  if (cloudflareSkillsCode !== 0) {
    console.warn(
      `○ Cloudflare agent skills not installed (optional). Retry: ${cloudflareSkillsInstallCommand()}`,
    );
  }

  console.log("\nReadiness");
  const readinessCode = runReadiness(root);
  if (readinessCode !== 0) {
    console.error(
      "\nSetup incomplete — fix blocking items above, then re-run `bun run setup`.",
    );
    process.exit(readinessCode);
  }

  if (setupConfig && (interactive || flags.syncSecrets)) {
    const bootstrapOptions = {
      autoConfirm: flags.syncSecrets,
      forceResync: flags.syncSecrets,
    };
    await bootstrapCiSecrets(root, setupConfig, cliContext, bootstrapOptions);
    await bootstrapGithubLabels(root, setupConfig, cliContext);
    const cloudflareResult = await bootstrapCloudflare(
      root,
      setupConfig,
      github,
      cliContext,
      bootstrapOptions,
    );
    if (cloudflareResult === "blocked") {
      process.exit(1);
    }
    const setupForProduction = readSetupConfig(root) ?? setupConfig;
    const prodResult =
      cloudflareResult === "complete" || cloudflareResult === "skipped"
        ? await bootstrapProduction(root, setupForProduction, {
            cliContext,
            autoConfirm: flags.syncSecrets,
          })
        : "skipped";
    if (prodResult === "failed") {
      console.log(
        "\n○ Setup incomplete — production secrets not fully synced. Re-run `bun run setup` after fixing items above.",
      );
      process.exit(1);
    }
    if (prodResult === "partial") {
      if (hasApexDomain(setupConfig.apexDomain)) {
        process.exit(1);
      }
      const finalConfig = readSetupConfig(root) ?? setupConfig;
      printSetupStackSummary({
        hasApex: hasApexDomain(finalConfig.apexDomain),
        productionSecretsSynced: Boolean(
          finalConfig.github?.syncedSecrets?.production,
        ),
        cloudflareDnsConfigured: Boolean(finalConfig.cloudflare?.dnsConfigured),
        cloudflareSynced: Boolean(finalConfig.cloudflare?.synced),
      });
      console.log(
        "\n✓ Setup complete — production partially synced (add an apex domain for Clerk when ready)",
      );
      return;
    }
  }

  if (setupConfig) {
    const finalConfig = readSetupConfig(root) ?? setupConfig;
    printSetupStackSummary({
      hasApex: hasApexDomain(finalConfig.apexDomain),
      productionSecretsSynced: Boolean(
        finalConfig.github?.syncedSecrets?.production,
      ),
      cloudflareDnsConfigured: Boolean(finalConfig.cloudflare?.dnsConfigured),
      cloudflareSynced: Boolean(finalConfig.cloudflare?.synced),
    });
  }

  console.log("\n✓ Setup complete — continue with docs/getting-started.md");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
