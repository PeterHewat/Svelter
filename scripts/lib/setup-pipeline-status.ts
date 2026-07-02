import { hasApexDomain } from "../../packages/config/validate-domain";
import { githubRulesetsUrl } from "./platform-urls";
import { shouldRebrandFromTemplate, type GitHubRepo } from "./repo-identity";
import type { SetupConfig } from "./setup-config";

export type SetupPipelineStatus = {
  developmentReady: boolean;
  productionReady: boolean;
  developmentMissing: string[];
  productionMissing: string[];
};

export type SetupFollowUp = {
  summary: string;
  steps: string[];
};

/**
 * Optional setup steps that did not complete — surfaced again at the end of `bun run setup`.
 *
 * @param config - Persisted setup config (`.svelter/setup.json`)
 */
export function assessSetupFollowUps(
  config: SetupConfig | null,
): SetupFollowUp[] {
  const followUps: SetupFollowUp[] = [];
  const github = config?.github;
  if (!github) {
    return followUps;
  }

  const repo: GitHubRepo = {
    org: github.org,
    repo: github.repo,
    repoUrl: `https://github.com/${github.org}/${github.repo}`,
  };

  if (!shouldRebrandFromTemplate(repo)) {
    return followUps;
  }

  if (github.syncedMergeSettings && !github.syncedBranchRules) {
    followUps.push({
      summary:
        "GitHub branch ruleset — not applied via API; on private Free, rules are not enforced until Team/Enterprise, Pro, or public",
      steps: [
        `Rulesets: ${githubRulesetsUrl(repo)}`,
        "Re-run `bun run setup` after upgrading or making the repository public",
        "See docs/ci-cd.md#branch-protection",
      ],
    });
  }

  return followUps;
}

/**
 * Assesses whether setup fulfilled the development and production pipeline tiers.
 *
 * @param config - Persisted setup config (`.svelter/setup.json`)
 */
export function assessSetupPipelineStatus(
  config: SetupConfig | null,
): SetupPipelineStatus {
  const developmentMissing: string[] = [];
  const productionMissing: string[] = [];

  if (!config?.github) {
    developmentMissing.push(
      "GitHub remote — add `origin` and re-run `bun run setup`",
    );
  } else {
    if (!config.github.syncedSecrets?.repo) {
      developmentMissing.push(
        "Dev CI repository secrets — re-run `bun run setup` and sync GitHub secrets",
      );
    }
    if (!config.github.syncedSecrets?.cloudflare) {
      developmentMissing.push(
        "Cloudflare deploy secrets on GitHub — re-run `bun run setup`",
      );
    }
    if (!config.github.syncedLabels) {
      developmentMissing.push(
        "GitHub issue/PR labels — re-run `bun run setup`",
      );
    }
  }

  if (!config?.cloudflare?.synced) {
    developmentMissing.push(
      "Cloudflare Pages projects — re-run `bun run setup` and complete the Cloudflare step",
    );
  }

  const hasApex = hasApexDomain(config?.apexDomain);
  if (!config?.github?.syncedSecrets?.production) {
    productionMissing.push(
      hasApex
        ? "GitHub `production` environment secrets — re-run `bun run setup`"
        : "GitHub `production` environment secrets — re-run `bun run setup` when ready for `release-*` deploys",
    );
  } else if (hasApex && !config?.cloudflare?.dnsConfigured) {
    productionMissing.push(
      "Apex DNS — point registrar nameservers at Cloudflare, then re-run `bun run setup`",
    );
  }

  return {
    developmentReady: developmentMissing.length === 0,
    productionReady: productionMissing.length === 0,
    developmentMissing,
    productionMissing,
  };
}
