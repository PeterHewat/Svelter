import { describe, expect, it } from "vitest";
import { GITHUB_LABELS, githubLabelCreateArgs } from "./github-labels";

describe("github-labels", () => {
  it("defines unique label names", () => {
    const names = GITHUB_LABELS.map((label) => label.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("builds gh label create args", () => {
    expect(githubLabelCreateArgs("acme/my-app", GITHUB_LABELS[0]!)).toEqual([
      "label",
      "create",
      "breaking-change",
      "--color",
      "b60205",
      "--description",
      "Breaking API or behavior change",
      "--force",
      "-R",
      "acme/my-app",
    ]);
  });
});
