/** Display name of the aggregate CI gate job in [.github/workflows/ci.yml](../../.github/workflows/ci.yml). */
export const GITHUB_REQUIRED_CI_STATUS_CHECK = "CI required";

/** Repository ruleset name applied to the default branch by setup. */
export const GITHUB_MAIN_BRANCH_RULESET_NAME = "main";

/** GitHub repository merge settings synced by setup (`PATCH /repos/{owner}/{repo}`). */
export type GithubMergeSettings = {
  allow_squash_merge: boolean;
  allow_merge_commit: boolean;
  allow_rebase_merge: boolean;
  allow_auto_merge: boolean;
  delete_branch_on_merge: boolean;
  allow_update_branch: boolean;
};

/** Summary row from `GET /repos/{owner}/{repo}/rulesets`. */
export type GithubRulesetSummary = {
  id: number;
  name: string;
  source_type?: string;
};

/**
 * Merge settings for adopted forks: squash-only, auto-merge, branch cleanup, update suggestions.
 *
 * @returns Body for `PATCH /repos/{owner}/{repo}`
 */
export function buildGithubMergeSettings(): GithubMergeSettings {
  return {
    allow_squash_merge: true,
    allow_merge_commit: false,
    allow_rebase_merge: false,
    allow_auto_merge: true,
    delete_branch_on_merge: true,
    allow_update_branch: true,
  };
}

/**
 * Branch ruleset payload for the default branch (`main`).
 *
 * Requires linear history, pull requests, and the CI aggregate check from [ci.yml](../../.github/workflows/ci.yml).
 *
 * @returns Body for `POST` / `PUT` `/repos/{owner}/{repo}/rulesets`
 */
export function buildGithubMainBranchRulesetPayload(): {
  name: string;
  target: "branch";
  enforcement: "active";
  conditions: {
    ref_name: { include: string[]; exclude: string[] };
  };
  rules: Array<
    | { type: "required_linear_history" }
    | {
        type: "pull_request";
        parameters: {
          allowed_merge_methods: ["squash"];
          dismiss_stale_reviews_on_push: boolean;
          require_code_owner_review: boolean;
          require_last_push_approval: boolean;
          required_approving_review_count: number;
          required_review_thread_resolution: boolean;
        };
      }
    | {
        type: "required_status_checks";
        parameters: {
          strict_required_status_checks_policy: boolean;
          required_status_checks: Array<{ context: string }>;
        };
      }
  >;
} {
  return {
    name: GITHUB_MAIN_BRANCH_RULESET_NAME,
    target: "branch",
    enforcement: "active",
    conditions: {
      ref_name: {
        include: ["~DEFAULT_BRANCH"],
        exclude: [],
      },
    },
    rules: [
      { type: "required_linear_history" },
      {
        type: "pull_request",
        parameters: {
          allowed_merge_methods: ["squash"],
          dismiss_stale_reviews_on_push: false,
          require_code_owner_review: false,
          require_last_push_approval: false,
          required_approving_review_count: 0,
          required_review_thread_resolution: false,
        },
      },
      {
        type: "required_status_checks",
        parameters: {
          strict_required_status_checks_policy: true,
          required_status_checks: [
            { context: GITHUB_REQUIRED_CI_STATUS_CHECK },
          ],
        },
      },
    ],
  };
}

/**
 * Whether GitHub rejected rulesets because the repo is private on a free plan.
 *
 * Rules can be created in the UI but are not enforced until Team/Enterprise, Pro, or public.
 *
 * @param message - stderr from `gh api`
 */
export function isGithubRulesetPlanBlocked(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("github pro") ||
    lower.includes("github team") ||
    lower.includes("enterprise") ||
    lower.includes("make this repository public")
  );
}

/**
 * Finds a repository-owned ruleset by name (ignores org/enterprise rulesets).
 *
 * @param rulesets - Parsed ruleset list from the GitHub API
 * @param name - Ruleset name to match
 */
export function findRepositoryRulesetByName(
  rulesets: GithubRulesetSummary[],
  name: string,
): GithubRulesetSummary | null {
  const normalized = name.trim().toLowerCase();
  return (
    rulesets.find(
      (ruleset) =>
        ruleset.name.trim().toLowerCase() === normalized &&
        (ruleset.source_type === undefined ||
          ruleset.source_type === "Repository"),
    ) ?? null
  );
}

/**
 * Parses `GET /repos/{owner}/{repo}/rulesets` JSON into summary rows.
 *
 * @param raw - API response body
 */
export function parseGithubRulesetSummaries(
  raw: unknown,
): GithubRulesetSummary[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const summaries: GithubRulesetSummary[] = [];
  for (const entry of raw) {
    if (
      typeof entry !== "object" ||
      entry === null ||
      typeof (entry as { id?: unknown }).id !== "number" ||
      typeof (entry as { name?: unknown }).name !== "string"
    ) {
      continue;
    }
    const typed = entry as {
      id: number;
      name: string;
      source_type?: string;
    };
    summaries.push({
      id: typed.id,
      name: typed.name,
      source_type: typed.source_type,
    });
  }
  return summaries;
}
