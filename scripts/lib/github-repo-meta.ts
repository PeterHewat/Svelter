import type { GitHubRepo } from "./repo-identity";
import { readSpawnPipe } from "./spawn-io";

/**
 * Fetches the GitHub repository About description via `gh api` (best effort).
 *
 * @param github - Parsed GitHub remote
 */
export async function fetchGitHubRepoDescription(
  github: GitHubRepo,
): Promise<string | null> {
  const proc = Bun.spawn(
    ["gh", "api", `repos/${github.org}/${github.repo}`, "--jq", ".description"],
    {
      stdout: "pipe",
      stderr: "ignore",
    },
  );
  const code = await proc.exited;
  if (code !== 0) {
    return null;
  }
  const text = await readSpawnPipe(proc.stdout);
  if (!text || text === "null") {
    return null;
  }
  return text;
}

/**
 * Sets the GitHub repository About description via `gh api` (best effort).
 *
 * @param github - Parsed GitHub remote or setup `github` block
 * @param description - Repository description (GitHub max 350 characters)
 * @returns Whether the API call succeeded
 */
export async function setGitHubRepoDescription(
  github: Pick<GitHubRepo, "org" | "repo">,
  description: string,
): Promise<boolean> {
  const proc = Bun.spawn(
    [
      "gh",
      "api",
      "-X",
      "PATCH",
      `repos/${github.org}/${github.repo}`,
      "-f",
      `description=${description}`,
    ],
    {
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  return (await proc.exited) === 0;
}
