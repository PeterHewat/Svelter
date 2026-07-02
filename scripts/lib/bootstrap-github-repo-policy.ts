/* eslint-disable no-console -- CLI wizard */
import {
  buildGithubMainBranchRulesetPayload,
  buildGithubMergeSettings,
  findRepositoryRulesetByName,
  isGithubRulesetPlanBlocked,
  parseGithubRulesetSummaries,
} from "../../packages/config/github-repo-policy";
import { isGhAuthenticated } from "./gh-secrets";
import { printManualAction } from "./manual-action";
import { githubRulesetsUrl } from "./platform-urls";
import type { GitHubRepo } from "./repo-identity";
import { shouldRebrandFromTemplate } from "./repo-identity";
import type { SetupBootstrapOptions } from "./setup-args";
import { canAutomateGh, type SetupCliContext } from "./setup-cli";
import {
  markGithubBranchRulesSynced,
  markGithubMergeSettingsSynced,
  type SetupConfig,
} from "./setup-config";
import { readSpawnPipe } from "./spawn-io";

type GhApiResult = { ok: boolean; stdout: string; stderr: string };

/**
 * Runs an authenticated GitHub REST request via `gh api`.
 *
 * @param root - Repository root
 * @param method - HTTP method
 * @param path - API path without leading slash
 * @param body - Optional JSON request body
 */
async function ghApi(
  root: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<GhApiResult> {
  const args =
    body === undefined
      ? ["gh", "api", "-X", method, path]
      : ["gh", "api", "-X", method, path, "--input", "-"];
  let proc: ReturnType<typeof Bun.spawn>;
  try {
    proc = Bun.spawn(args, {
      cwd: root,
      stdin:
        body === undefined
          ? "ignore"
          : new Blob([JSON.stringify(body)], { type: "application/json" }),
      stdout: "pipe",
      stderr: "pipe",
    });
  } catch {
    return { ok: false, stdout: "", stderr: "" };
  }

  const code = await proc.exited;
  const stdout = await readSpawnPipe(proc.stdout);
  const stderr = await readSpawnPipe(proc.stderr);
  return { ok: code === 0, stdout, stderr };
}

/**
 * Applies squash-only merge settings and related pull request options.
 *
 * @param root - Repository root
 * @param github - Parsed GitHub repository
 */
export async function syncGithubMergeSettings(
  root: string,
  github: GitHubRepo,
): Promise<{ ok: boolean; message?: string }> {
  const path = `repos/${github.org}/${github.repo}`;
  const result = await ghApi(root, "PATCH", path, buildGithubMergeSettings());
  if (result.ok) {
    return { ok: true };
  }
  const message = result.stderr.trim() || `PATCH ${path} failed`;
  return { ok: false, message };
}

/**
 * Creates or updates the repository `main` branch ruleset.
 *
 * @param root - Repository root
 * @param github - Parsed GitHub repository
 */
export async function syncGithubMainBranchRuleset(
  root: string,
  github: GitHubRepo,
): Promise<{ ok: boolean; message?: string }> {
  const listPath = `repos/${github.org}/${github.repo}/rulesets?per_page=100`;
  const listed = await ghApi(root, "GET", listPath);
  if (!listed.ok) {
    return {
      ok: false,
      message: listed.stderr.trim() || `GET ${listPath} failed`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(listed.stdout);
  } catch {
    return { ok: false, message: "Invalid rulesets JSON from GitHub API" };
  }

  const payload = buildGithubMainBranchRulesetPayload();
  const existing = findRepositoryRulesetByName(
    parseGithubRulesetSummaries(parsed),
    payload.name,
  );

  const writePath = existing
    ? `repos/${github.org}/${github.repo}/rulesets/${existing.id}`
    : `repos/${github.org}/${github.repo}/rulesets`;
  const method = existing ? "PUT" : "POST";
  const written = await ghApi(root, method, writePath, payload);
  if (written.ok) {
    return { ok: true };
  }

  return {
    ok: false,
    message: written.stderr.trim() || `${method} ${writePath} failed`,
  };
}

/**
 * Syncs GitHub merge settings and a `main` branch ruleset once per adopted fork.
 *
 * Skips the upstream template (`PeterHewat/Svelter`). Requires repo admin access.
 *
 * @param root - Repository root
 * @param setup - Setup config
 * @param cliContext - CLI readiness from the prerequisites step
 */
export async function bootstrapGithubRepoPolicy(
  root: string,
  setup: SetupConfig,
  cliContext?: SetupCliContext,
  _options?: SetupBootstrapOptions,
): Promise<void> {
  const githubBlock = setup.github;
  if (!githubBlock) {
    return;
  }

  const github: GitHubRepo = {
    org: githubBlock.org,
    repo: githubBlock.repo,
    repoUrl: `https://github.com/${githubBlock.org}/${githubBlock.repo}`,
  };

  console.log("\nGitHub repo policy");

  if (!shouldRebrandFromTemplate(github)) {
    console.log("✓ Upstream template — skip");
    return;
  }

  const needMerge = !githubBlock.syncedMergeSettings;
  const needBranchRules = !githubBlock.syncedBranchRules;
  if (!needMerge && !needBranchRules) {
    console.log("✓ Already synced — skip");
    return;
  }

  const ghReady = cliContext
    ? canAutomateGh(cliContext)
    : await isGhAuthenticated();

  if (!ghReady) {
    printManualAction("Configure GitHub repo policy", [
      "Run `gh auth login -s repo,workflow`",
      "Re-run `bun run setup`",
      `Or configure manually: ${githubRulesetsUrl(github)}`,
    ]);
    return;
  }

  console.log(`  Configuring ${github.org}/${github.repo}...`);

  if (needMerge) {
    const merge = await syncGithubMergeSettings(root, github);
    if (merge.ok) {
      markGithubMergeSettingsSynced(root);
      console.log(
        "  ✓ Pull request merge settings (squash-only, auto-merge, branch cleanup)",
      );
    } else {
      console.log(`  ○ Merge settings — ${merge.message ?? "failed"}`);
      printManualAction("Configure GitHub merge settings", [
        `Settings → General → Pull Requests: ${github.repoUrl}/settings`,
        "Enable squash merge only, auto-merge, delete head branches, and suggest updating branches",
        "Re-run `bun run setup` after you have repository admin access",
      ]);
      return;
    }
  } else {
    console.log("  ✓ Merge settings already synced — skip");
  }

  if (needBranchRules) {
    const ruleset = await syncGithubMainBranchRuleset(root, github);
    if (ruleset.ok) {
      markGithubBranchRulesSynced(root);
      console.log(
        `  ✓ Branch ruleset "${buildGithubMainBranchRulesetPayload().name}"`,
      );
    } else if (ruleset.message && isGithubRulesetPlanBlocked(ruleset.message)) {
      console.log(
        "  ○ Branch ruleset — skipped (see Follow-ups at end of setup)",
      );
    } else {
      console.log(`  ○ Branch ruleset — ${ruleset.message ?? "failed"}`);
      printManualAction("Configure GitHub branch ruleset", [
        `Rulesets: ${githubRulesetsUrl(github)}`,
        "Create an active branch ruleset named `main` targeting the default branch",
        "Require linear history, pull requests, and status check `CI required`",
        "See docs/ci-cd.md#branch-protection",
        "Re-run `bun run setup` after you have repository admin access",
      ]);
    }
  } else {
    console.log("  ✓ Branch ruleset already synced — skip");
  }
}
