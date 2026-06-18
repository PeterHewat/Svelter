/** GitHub issue/PR label synced by setup (`gh label create --force`). */
export type GithubLabelSpec = {
  name: string;
  color: string;
  description: string;
};

/**
 * Label definitions for release notes, Dependabot, and triage.
 * Keep aligned with [.github/release.yml](../../.github/release.yml).
 */
export const GITHUB_LABELS: readonly GithubLabelSpec[] = [
  {
    name: "breaking-change",
    color: "b60205",
    description: "Breaking API or behavior change",
  },
  {
    name: "security",
    color: "ff0000",
    description: "Security fix or hardening",
  },
  {
    name: "enhancement",
    color: "0e8a16",
    description: "New feature or request",
  },
  {
    name: "fix",
    color: "d73a4a",
    description: "Bug fix (use on pull requests)",
  },
  {
    name: "bug",
    color: "d73a4a",
    description: "Something is not working (issues; also accepted on PRs)",
  },
  {
    name: "documentation",
    color: "0075ca",
    description: "Improvements or additions to documentation",
  },
  {
    name: "dependencies",
    color: "0366d6",
    description: "Dependency updates",
  },
  {
    name: "github-actions",
    color: "000000",
    description: "GitHub Actions version updates",
  },
  {
    name: "chore",
    color: "fef2c0",
    description: "Internal work with no user-facing impact",
  },
  {
    name: "test",
    color: "ededed",
    description: "Test-only changes (excluded from release notes)",
  },
  {
    name: "ignore-for-release",
    color: "ffffff",
    description: "Exclude from generated release notes",
  },
  {
    name: "monorepo",
    color: "ededed",
    description: "Monorepo-wide dependency update (Dependabot)",
  },
  {
    name: "typescript",
    color: "3178c6",
    description: "TypeScript-related dependency update (Dependabot)",
  },
  {
    name: "duplicate",
    color: "cfd3d7",
    description: "This issue or pull request already exists",
  },
  {
    name: "invalid",
    color: "e4e669",
    description: "This does not seem right",
  },
  {
    name: "wontfix",
    color: "ffffff",
    description: "This will not be worked on",
  },
  {
    name: "question",
    color: "d876e3",
    description: "Further information is requested",
  },
  {
    name: "good first issue",
    color: "7057ff",
    description: "Good for newcomers",
  },
  {
    name: "help wanted",
    color: "008672",
    description: "Extra attention is needed",
  },
] as const;

/**
 * Builds `gh label create` arguments for one label.
 *
 * @param repo - `org/repo` slug
 * @param label - Label metadata
 */
export function githubLabelCreateArgs(
  repo: string,
  label: GithubLabelSpec,
): string[] {
  return [
    "label",
    "create",
    label.name,
    "--color",
    label.color,
    "--description",
    label.description,
    "--force",
    "-R",
    repo,
  ];
}
