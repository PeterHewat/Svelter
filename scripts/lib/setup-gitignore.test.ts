import { describe, expect, test } from "bun:test";
import {
  isAdoptedTemplateRepo,
  removeSetupJsonFromGitignore,
  SETUP_JSON_GITIGNORE_ENTRY,
} from "./setup-gitignore";
import type { GitHubRepo } from "./repo-identity";

const upstream: GitHubRepo = {
  org: "PeterHewat",
  repo: "Svelter",
  repoUrl: "https://github.com/PeterHewat/Svelter",
};

const adopted: GitHubRepo = {
  org: "PeterHewat",
  repo: "Extractora",
  repoUrl: "https://github.com/PeterHewat/Extractora",
};

describe("isAdoptedTemplateRepo", () => {
  test("is false for the upstream Svelter template remote", () => {
    expect(isAdoptedTemplateRepo({ github: upstream })).toBe(false);
  });

  test("is true for a repo created from the GitHub template", () => {
    expect(isAdoptedTemplateRepo({ github: adopted })).toBe(true);
  });

  test("is true when product name diverges from template default", () => {
    expect(isAdoptedTemplateRepo({ productName: "Extractora" })).toBe(true);
  });

  test("is false when only the template product name is set", () => {
    expect(isAdoptedTemplateRepo({ productName: "Svelter" })).toBe(false);
  });
});

describe("removeSetupJsonFromGitignore", () => {
  test("removes the setup.json entry and preserves trailing newline", () => {
    const input = `# meta\n${SETUP_JSON_GITIGNORE_ENTRY}\n.svelter/*.env\n`;
    const { content, removed } = removeSetupJsonFromGitignore(input);
    expect(removed).toBe(true);
    expect(content).toBe("# meta\n.svelter/*.env\n");
    expect(content.includes(SETUP_JSON_GITIGNORE_ENTRY)).toBe(false);
  });

  test("is idempotent when the entry is already absent", () => {
    const input = ".svelter/*.env\n";
    const { content, removed } = removeSetupJsonFromGitignore(input);
    expect(removed).toBe(false);
    expect(content).toBe(input);
  });
});
