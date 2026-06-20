import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "bun:test";
import {
  ensureAgentLinks,
  ensureClaudeAgentsLink,
  ensureClaudeMdLink,
  ensureGitSymlinksEnabled,
  isSymlinkTo,
} from "./agent-links";

describe("agent-links", () => {
  let root = "";

  afterEach(() => {
    if (root) {
      rmSync(root, { recursive: true, force: true });
      root = "";
    }
  });

  it("creates .claude → .agents symlink idempotently", () => {
    root = mkdtempSync(join(tmpdir(), "svelter-agent-links-"));
    ensureClaudeAgentsLink(root);
    ensureClaudeAgentsLink(root);
    expect(isSymlinkTo(join(root, ".claude"), join(root, ".agents"))).toBe(
      true,
    );
  });

  it("replaces an existing .claude directory with .claude → .agents", () => {
    root = mkdtempSync(join(tmpdir(), "svelter-agent-links-"));
    const claudeSkills = join(root, ".claude/skills");
    mkdirSync(claudeSkills, { recursive: true });
    writeFileSync(join(claudeSkills, "stale.txt"), "remove me");
    ensureClaudeAgentsLink(root);
    expect(isSymlinkTo(join(root, ".claude"), join(root, ".agents"))).toBe(
      true,
    );
  });

  it("creates CLAUDE.md symlink to AGENTS.md", () => {
    root = mkdtempSync(join(tmpdir(), "svelter-agent-links-"));
    writeFileSync(join(root, "AGENTS.md"), "# AGENTS\n");
    writeFileSync(join(root, "CLAUDE.md"), "# duplicate\n");
    ensureClaudeMdLink(root);
    expect(isSymlinkTo(join(root, "CLAUDE.md"), join(root, "AGENTS.md"))).toBe(
      true,
    );
  });

  it("ensureGitSymlinksEnabled is a no-op outside a git repo", () => {
    root = mkdtempSync(join(tmpdir(), "svelter-agent-links-"));
    expect(() => ensureGitSymlinksEnabled(root)).not.toThrow();
  });

  it("ensureAgentLinks wires .claude → .agents and CLAUDE.md symlinks", () => {
    root = mkdtempSync(join(tmpdir(), "svelter-agent-links-"));
    writeFileSync(join(root, "AGENTS.md"), "# AGENTS\n");
    ensureAgentLinks(root);
    expect(isSymlinkTo(join(root, ".claude"), join(root, ".agents"))).toBe(
      true,
    );
    expect(isSymlinkTo(join(root, "CLAUDE.md"), join(root, "AGENTS.md"))).toBe(
      true,
    );
  });
});
