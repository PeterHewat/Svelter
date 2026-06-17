/* eslint-disable no-console -- CLI output */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ensureClaudeAgentsLink } from "./agent-links";

const CONVEX_SKILLS_MARKER = ".agents/skills/convex/SKILL.md";

/** Cursor target — installs to `.agents/skills/` (`.claude` → `.agents`). */
const AGENT_SKILLS_TARGET = "cursor";

const CLERK_SETUP_SKILLS = [
  "clerk-react-patterns",
  "clerk-testing",
  "clerk-backend-api",
] as const;

/** Cloudflare Pages / Wrangler skills for static hosting in this template. */
const CLOUDFLARE_SETUP_SKILLS = ["cloudflare", "wrangler"] as const;

/**
 * Cursor installs to `.agents/skills/`; Claude Code reads the same tree via `.claude` → `.agents`.
 */
const CLERK_SETUP_AGENT = AGENT_SKILLS_TARGET;

/**
 * Returns whether one Clerk skill is present under `.agents/skills/`.
 *
 * @param root - Repository root
 * @param skill - Skill directory name
 */
function clerkSkillInstalled(root: string, skill: string): boolean {
  return existsSync(resolve(root, `.agents/skills/${skill}/SKILL.md`));
}

/**
 * Clerk skills from {@link CLERK_SETUP_SKILLS} that are not installed yet.
 *
 * @param root - Repository root
 */
export function missingClerkAgentSkills(root: string): string[] {
  return CLERK_SETUP_SKILLS.filter(
    (skill) => !clerkSkillInstalled(root, skill),
  );
}

/**
 * Returns whether all Svelter Clerk skills are installed for Cursor / Claude Code.
 *
 * @param root - Repository root
 */
export function areClerkAgentSkillsInstalled(root: string): boolean {
  return missingClerkAgentSkills(root).length === 0;
}

/**
 * Returns whether `skills-lock.json` lists all Svelter Clerk skills.
 *
 * @param root - Repository root
 */
export function clerkSkillsLockComplete(root: string): boolean {
  const lockPath = resolve(root, "skills-lock.json");
  if (!existsSync(lockPath)) {
    return false;
  }
  try {
    const lock = JSON.parse(readFileSync(lockPath, "utf8")) as {
      skills?: Record<string, unknown>;
    };
    return CLERK_SETUP_SKILLS.every((skill) => lock.skills?.[skill]);
  } catch {
    return false;
  }
}

/**
 * Runs `bunx skills add` for the Svelter Clerk skill subset (Cursor target only).
 *
 * @param root - Repository root
 */
async function runClerkSkillsAdd(root: string): Promise<number> {
  const args = [
    "bunx",
    "skills",
    "add",
    "clerk/skills",
    "-y",
    "-a",
    CLERK_SETUP_AGENT,
    ...CLERK_SETUP_SKILLS.flatMap((skill) => ["--skill", skill]),
  ];
  console.log(`\n→ ${args.join(" ")}`);
  const proc = Bun.spawn(args, {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  return (await proc.exited) ?? 1;
}

/**
 * Installs or updates Convex agent skills (best effort; optional).
 *
 * @param root - Repository root
 * @returns Process exit code (0 = success)
 */
export async function runConvexAgentSkillsIfNeeded(
  root: string,
): Promise<number> {
  ensureClaudeAgentsLink(root);

  const installed = existsSync(resolve(root, CONVEX_SKILLS_MARKER));
  const subcommand = installed ? "update" : "install";
  console.log(`\n→ bunx convex ai-files ${subcommand}`);
  const proc = Bun.spawn(["bunx", "convex", "ai-files", subcommand], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = (await proc.exited) ?? 1;
  ensureClaudeAgentsLink(root);
  if (code === 0) {
    console.log(
      installed
        ? "✓ Convex agent skills updated"
        : "✓ Convex agent skills installed",
    );
  }
  return code;
}

/**
 * Installs Svelter-relevant Clerk agent skills (best effort; optional).
 *
 * @param root - Repository root
 * @returns Process exit code (0 = success)
 */
export async function runClerkAgentSkillsIfNeeded(
  root: string,
): Promise<number> {
  ensureClaudeAgentsLink(root);

  const missing = missingClerkAgentSkills(root);
  if (missing.length === 0) {
    if (!clerkSkillsLockComplete(root)) {
      console.log(
        "\n→ Clerk skills on disk but skills-lock.json is missing Clerk entries — refreshing lock",
      );
      const code = await runClerkSkillsAdd(root);
      ensureClaudeAgentsLink(root);
      if (code === 0) {
        console.log(
          `✓ Clerk agent skills lock refreshed (${CLERK_SETUP_SKILLS.join(", ")})`,
        );
      }
      return code;
    }
    console.log(
      `\n✓ Clerk agent skills present (${CLERK_SETUP_SKILLS.join(", ")}) — .agents/skills/ (gitignored)`,
    );
    return 0;
  }

  console.log(`\n→ Installing Clerk agent skills: ${missing.join(", ")}`);
  const code = await runClerkSkillsAdd(root);
  ensureClaudeAgentsLink(root);
  if (code === 0 && areClerkAgentSkillsInstalled(root)) {
    console.log(
      `✓ Clerk agent skills installed (${CLERK_SETUP_SKILLS.join(", ")})`,
    );
  }
  return code;
}

/**
 * Returns the shell command to restore Clerk skills manually.
 */
export function clerkSkillsInstallCommand(): string {
  const skills = CLERK_SETUP_SKILLS.map((s) => `--skill ${s}`).join(" ");
  return `bunx skills add clerk/skills -y -a ${AGENT_SKILLS_TARGET} ${skills}`;
}

/**
 * Returns whether one Cloudflare skill is present under `.agents/skills/`.
 *
 * @param root - Repository root
 * @param skill - Skill directory name
 */
function cloudflareSkillInstalled(root: string, skill: string): boolean {
  return existsSync(resolve(root, `.agents/skills/${skill}/SKILL.md`));
}

/**
 * Cloudflare skills from {@link CLOUDFLARE_SETUP_SKILLS} that are not installed yet.
 *
 * @param root - Repository root
 */
export function missingCloudflareAgentSkills(root: string): string[] {
  return CLOUDFLARE_SETUP_SKILLS.filter(
    (skill) => !cloudflareSkillInstalled(root, skill),
  );
}

/**
 * Returns whether Svelter Cloudflare agent skills are installed.
 *
 * @param root - Repository root
 */
export function areCloudflareAgentSkillsInstalled(root: string): boolean {
  return missingCloudflareAgentSkills(root).length === 0;
}

/**
 * Runs `bunx skills add` for the Svelter Cloudflare skill subset.
 *
 * @param root - Repository root
 */
async function runCloudflareSkillsAdd(root: string): Promise<number> {
  const args = [
    "bunx",
    "skills",
    "add",
    "cloudflare/skills",
    "-y",
    "-a",
    AGENT_SKILLS_TARGET,
    ...CLOUDFLARE_SETUP_SKILLS.flatMap((skill) => ["--skill", skill]),
  ];
  console.log(`\n→ ${args.join(" ")}`);
  const proc = Bun.spawn(args, {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  return (await proc.exited) ?? 1;
}

/**
 * Installs Svelter-relevant Cloudflare agent skills (best effort; optional).
 *
 * @param root - Repository root
 * @returns Process exit code (0 = success)
 */
export async function runCloudflareAgentSkillsIfNeeded(
  root: string,
): Promise<number> {
  ensureClaudeAgentsLink(root);

  const missing = missingCloudflareAgentSkills(root);
  if (missing.length === 0) {
    console.log(
      `\n✓ Cloudflare agent skills present (${CLOUDFLARE_SETUP_SKILLS.join(", ")}) — .agents/skills/ (gitignored)`,
    );
    return 0;
  }

  console.log(`\n→ Installing Cloudflare agent skills: ${missing.join(", ")}`);
  const code = await runCloudflareSkillsAdd(root);
  ensureClaudeAgentsLink(root);
  if (code === 0 && areCloudflareAgentSkillsInstalled(root)) {
    console.log(
      `✓ Cloudflare agent skills installed (${CLOUDFLARE_SETUP_SKILLS.join(", ")})`,
    );
  }
  return code;
}

/**
 * Returns the shell command to restore Cloudflare skills manually.
 */
export function cloudflareSkillsInstallCommand(): string {
  const skills = CLOUDFLARE_SETUP_SKILLS.map((s) => `--skill ${s}`).join(" ");
  return `bunx skills add cloudflare/skills -y -a ${AGENT_SKILLS_TARGET} ${skills}`;
}
