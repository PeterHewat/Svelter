import {
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { resolve } from "node:path";

/**
 * Ensures `core.symlinks=true` for this clone so Git checks out committed symlinks correctly.
 * Safe on every OS (already the default on macOS and Linux); required on many Windows Git installs.
 *
 * @param root - Repository root
 */
export function ensureGitSymlinksEnabled(root: string): void {
  if (!existsSync(resolve(root, ".git"))) {
    return;
  }
  const proc = Bun.spawnSync(
    ["git", "config", "--local", "core.symlinks", "true"],
    {
      cwd: root,
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  if (proc.exitCode !== 0) {
    return;
  }
}

/**
 * Configures Git symlink checkout (Windows) and shared agent paths for Cursor / Claude Code.
 *
 * @param root - Repository root
 */
export function ensureAgentLinks(root: string): void {
  ensureGitSymlinksEnabled(root);
  ensureClaudeAgentsLink(root);
  ensureClaudeMdLink(root);
}

/**
 * Returns whether `path` is a symlink whose target resolves to `expectedTarget`.
 *
 * @param path - Candidate symlink path
 * @param expectedTarget - Expected directory or file target
 */
export function isSymlinkTo(path: string, expectedTarget: string): boolean {
  if (!existsSync(path)) {
    return false;
  }
  try {
    if (!lstatSync(path).isSymbolicLink()) {
      return false;
    }
    return realpathSync(path) === realpathSync(expectedTarget);
  } catch {
    return false;
  }
}

/**
 * Ensures `.claude` points at `.agents` so Cursor, Claude Code, and Convex `ai-files`
 * share one skills tree (`.claude/skills` → `.agents/skills`).
 *
 * Replaces a real `.claude` directory (e.g. after Convex wrote only under `.claude/skills`).
 *
 * @param root - Repository root
 */
export function ensureClaudeAgentsLink(root: string): void {
  const agents = resolve(root, ".agents");
  const claude = resolve(root, ".claude");

  mkdirSync(resolve(agents, "skills"), { recursive: true });

  if (isSymlinkTo(claude, agents)) {
    return;
  }

  if (existsSync(claude)) {
    rmSync(claude, { recursive: true, force: true });
  }

  symlinkSync(".agents", claude);
}

/**
 * Ensures `CLAUDE.md` is a symlink to `AGENTS.md` (Convex `ai-files install` updates both paths).
 *
 * @param root - Repository root
 */
export function ensureClaudeMdLink(root: string): void {
  const agentsMd = resolve(root, "AGENTS.md");
  const claudeMd = resolve(root, "CLAUDE.md");

  if (!existsSync(agentsMd)) {
    return;
  }

  if (isSymlinkTo(claudeMd, agentsMd)) {
    return;
  }

  if (existsSync(claudeMd)) {
    rmSync(claudeMd);
  }

  symlinkSync("AGENTS.md", claudeMd);
}

/**
 * Returns the symlink target for `path` when it is a symlink; otherwise `null`.
 *
 * @param path - Path to inspect
 */
export function readSymlinkTarget(path: string): string | null {
  if (!existsSync(path)) {
    return null;
  }
  try {
    if (!lstatSync(path).isSymbolicLink()) {
      return null;
    }
    return readlinkSync(path);
  } catch {
    return null;
  }
}
