import { describe, expect, it } from "vitest";
import {
  formatGithubRepoUrl,
  parseGithubRemote,
  resolveGithubRepoUrl,
} from "./github-repo";

describe("parseGithubRemote", () => {
  it("parses HTTPS remotes", () => {
    expect(parseGithubRemote("https://github.com/acme/my-app.git")).toEqual({
      org: "acme",
      repo: "my-app",
    });
  });

  it("parses SSH remotes", () => {
    expect(parseGithubRemote("git@github.com:acme/my-app.git")).toEqual({
      org: "acme",
      repo: "my-app",
    });
  });
});

describe("resolveGithubRepoUrl", () => {
  it("prefers PUBLIC_GITHUB_REPO_URL", () => {
    expect(
      resolveGithubRepoUrl({
        publicGithubRepoUrl: "https://github.com/custom/repo",
        githubRepository: "acme/my-app",
        gitRemoteUrl: "https://github.com/other/app.git",
      }),
    ).toBe("https://github.com/custom/repo");
  });

  it("uses GITHUB_REPOSITORY in CI", () => {
    expect(
      resolveGithubRepoUrl({
        githubRepository: "acme/my-app",
      }),
    ).toBe(formatGithubRepoUrl("acme", "my-app"));
  });

  it("falls back to git remote", () => {
    expect(
      resolveGithubRepoUrl({
        gitRemoteUrl: "https://github.com/acme/my-app.git",
      }),
    ).toBe("https://github.com/acme/my-app");
  });

  it("falls back to the template upstream URL", () => {
    expect(resolveGithubRepoUrl({})).toBe(
      "https://github.com/PeterHewat/Svelter",
    );
  });
});
