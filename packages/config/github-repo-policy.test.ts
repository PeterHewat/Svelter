import { describe, expect, it } from "vitest";
import {
  GITHUB_MAIN_BRANCH_RULESET_NAME,
  GITHUB_REQUIRED_CI_STATUS_CHECK,
  buildGithubMainBranchRulesetPayload,
  buildGithubMergeSettings,
  findRepositoryRulesetByName,
  isGithubRulesetPlanBlocked,
  parseGithubRulesetSummaries,
} from "./github-repo-policy";

describe("github-repo-policy", () => {
  it("builds squash-only merge settings with auto-merge and branch cleanup", () => {
    expect(buildGithubMergeSettings()).toEqual({
      allow_squash_merge: true,
      allow_merge_commit: false,
      allow_rebase_merge: false,
      allow_auto_merge: true,
      delete_branch_on_merge: true,
      allow_update_branch: true,
    });
  });

  it("builds main branch ruleset with linear history, PRs, and CI required", () => {
    const payload = buildGithubMainBranchRulesetPayload();
    expect(payload.name).toBe(GITHUB_MAIN_BRANCH_RULESET_NAME);
    expect(payload.conditions.ref_name.include).toContain("~DEFAULT_BRANCH");
    expect(payload.rules.map((rule) => rule.type)).toEqual([
      "required_linear_history",
      "pull_request",
      "required_status_checks",
    ]);
    const statusChecks = payload.rules.find(
      (rule) => rule.type === "required_status_checks",
    );
    expect(statusChecks?.parameters.required_status_checks).toEqual([
      { context: GITHUB_REQUIRED_CI_STATUS_CHECK },
    ]);
    expect(statusChecks?.parameters.strict_required_status_checks_policy).toBe(
      true,
    );
  });

  it("parses ruleset summaries and finds repository-owned rulesets", () => {
    const parsed = parseGithubRulesetSummaries([
      { id: 1, name: "org-wide", source_type: "Organization" },
      { id: 2, name: "main", source_type: "Repository" },
      { invalid: true },
    ]);
    expect(parsed).toHaveLength(2);
    expect(findRepositoryRulesetByName(parsed, "main")?.id).toBe(2);
    expect(findRepositoryRulesetByName(parsed, "org-wide")).toBeNull();
  });

  it("detects GitHub plan blocks for private-repo rulesets", () => {
    expect(
      isGithubRulesetPlanBlocked(
        "gh: Upgrade to GitHub Pro or make this repository public to enable this feature. (HTTP 403)",
      ),
    ).toBe(true);
    expect(
      isGithubRulesetPlanBlocked(
        "Your rules won't be enforced until you move to a GitHub Team or Enterprise organization account.",
      ),
    ).toBe(true);
    expect(isGithubRulesetPlanBlocked("resource not found")).toBe(false);
  });
});
