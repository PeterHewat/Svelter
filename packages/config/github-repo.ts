/** Upstream template repository (GitHub "Use this template" source). */
const TEMPLATE_GITHUB_REPO_URL = "https://github.com/PeterHewat/Svelter";

/**
 * Builds a canonical `https://github.com/{org}/{repo}` URL.
 *
 * @param org - GitHub owner or organization
 * @param repo - Repository name without `.git`
 */
export function formatGithubRepoUrl(org: string, repo: string): string {
  return `https://github.com/${org}/${repo}`;
}

/**
 * Parses a GitHub repository from `git remote` style URLs.
 *
 * @param raw - Remote URL (HTTPS or SSH)
 * @returns Owner and repo name, or null when not GitHub
 */
export function parseGithubRemote(
  raw: string,
): { org: string; repo: string } | null {
  const trimmed = raw.trim();
  const match =
    trimmed.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/i) ??
    trimmed.match(/github\.com[/:]([^/]+)\/([^/]+)/i);
  if (!match) {
    return null;
  }

  const org = match[1]!;
  const repo = match[2]!.replace(/\.git$/i, "");
  if (!org || !repo) {
    return null;
  }

  return { org, repo };
}

export type GithubRepoUrlSource = {
  /** Optional explicit override (`PUBLIC_GITHUB_REPO_URL`). */
  publicGithubRepoUrl?: string;
  /** GitHub Actions `GITHUB_REPOSITORY` (`org/repo`). */
  githubRepository?: string;
  /** `git remote get-url origin` value. */
  gitRemoteUrl?: string;
};

/**
 * Resolves the repository URL for marketing links and metadata.
 *
 * Priority: `PUBLIC_GITHUB_REPO_URL` → `GITHUB_REPOSITORY` → git remote → template upstream.
 *
 * @param source - Build-time inputs (env + optional git remote)
 */
export function resolveGithubRepoUrl(source: GithubRepoUrlSource = {}): string {
  const explicit = source.publicGithubRepoUrl?.trim();
  if (explicit) {
    return explicit;
  }

  const actionsRepo = source.githubRepository?.trim();
  if (actionsRepo) {
    const [org, repo] = actionsRepo.split("/");
    if (org && repo) {
      return formatGithubRepoUrl(org, repo);
    }
  }

  if (source.gitRemoteUrl) {
    const parsed = parseGithubRemote(source.gitRemoteUrl);
    if (parsed) {
      return formatGithubRepoUrl(parsed.org, parsed.repo);
    }
  }

  return TEMPLATE_GITHUB_REPO_URL;
}
