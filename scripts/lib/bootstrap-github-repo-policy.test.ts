import { describe, expect, it } from "bun:test";
import {
  buildGithubMainBranchRulesetPayload,
  findRepositoryRulesetByName,
  isGithubRulesetPlanBlocked,
  parseGithubRulesetSummaries,
} from "../../packages/config/github-repo-policy";

describe("bootstrap-github-repo-policy helpers", () => {
  it("reuses config ruleset payload shape for create and update", () => {
    const payload = buildGithubMainBranchRulesetPayload();
    expect(payload.enforcement).toBe("active");
    expect(payload.rules).toHaveLength(3);
  });

  it("selects an existing repository ruleset id for updates", () => {
    const rulesets = parseGithubRulesetSummaries([
      { id: 99, name: "main", source_type: "Repository" },
    ]);
    expect(findRepositoryRulesetByName(rulesets, "main")?.id).toBe(99);
  });

  it("detects plan-blocked ruleset errors", () => {
    expect(
      isGithubRulesetPlanBlocked(
        "Upgrade to GitHub Pro or make this repository public",
      ),
    ).toBe(true);
  });
});
