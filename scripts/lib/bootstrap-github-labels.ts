/* eslint-disable no-console -- CLI wizard */
import {
  GITHUB_LABELS,
  githubLabelCreateArgs,
} from "../../packages/config/github-labels";
import { isGhAuthenticated } from "./gh-secrets";
import { printManualAction } from "./manual-action";
import { canAutomateGh, type SetupCliContext } from "./setup-cli";
import { markGithubLabelsSynced, type SetupConfig } from "./setup-config";
import type { GitHubRepo } from "./repo-identity";

/**
 * Creates or updates GitHub issue/PR labels via `gh label create --force`.
 *
 * @param root - Repository root
 * @param github - Parsed GitHub repository
 */
export async function syncGithubLabels(
  root: string,
  github: GitHubRepo,
): Promise<boolean> {
  const repoSlug = `${github.org}/${github.repo}`;

  for (const label of GITHUB_LABELS) {
    const proc = Bun.spawn(["gh", ...githubLabelCreateArgs(repoSlug, label)], {
      cwd: root,
      stdout: "pipe",
      stderr: "pipe",
    });
    const code = await proc.exited;
    if (code !== 0) {
      const stderr = await new Response(proc.stderr).text();
      console.error(
        `  ✗ ${label.name}${stderr.trim() ? ` — ${stderr.trim()}` : ""}`,
      );
      return false;
    }
    console.log(`  ✓ ${label.name}`);
  }

  return true;
}

/**
 * Syncs GitHub labels once per fork (`github.labelsSynced` in setup config).
 *
 * @param root - Repository root
 * @param setup - Setup config
 * @param cliContext - CLI readiness from the prerequisites step
 */
export async function bootstrapGithubLabels(
  root: string,
  setup: SetupConfig,
  cliContext?: SetupCliContext,
): Promise<void> {
  const github = setup.github;
  if (!github) {
    return;
  }

  console.log("\nGitHub labels");
  if (github.labelsSynced) {
    console.log("✓ Already synced — skip");
    return;
  }

  const ghReady = cliContext
    ? canAutomateGh(cliContext)
    : await isGhAuthenticated();

  if (!ghReady) {
    console.log(
      "○ Skipped — run `gh auth login -s repo,workflow` and re-run setup",
    );
    printManualAction("Sync labels manually", [
      "Authenticate: `gh auth login -s repo,workflow`",
      "Re-run `bun run setup`",
    ]);
    return;
  }

  const repo: GitHubRepo = {
    org: github.org,
    repo: github.repo,
    repoUrl: `https://github.com/${github.org}/${github.repo}`,
  };

  console.log(
    `  Syncing ${GITHUB_LABELS.length} labels to ${repo.org}/${repo.repo}...`,
  );
  const ok = await syncGithubLabels(root, repo);
  if (!ok) {
    console.log(
      "○ Label sync incomplete — re-run `bun run setup` after fixing errors above",
    );
    return;
  }

  markGithubLabelsSynced(root);
  console.log("✓ GitHub labels synced");
}
