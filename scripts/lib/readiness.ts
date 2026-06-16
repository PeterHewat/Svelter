/* eslint-disable no-console -- CLI output via setup */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  isPlaceholderEnvValue,
  isRealConvexDeployment,
  parseDotenvAssignmentValue,
} from "../../packages/config/env-placeholders";
import { isPlaceholderE2eEmail } from "../../packages/config/e2e-auth";
import { areClerkAgentSkillsInstalled } from "./agent-skills";
import {
  readClerkPublishableKey,
  readConvexUrlFromWebEnv,
} from "./clerk-web-env";
import { isConvexLinked } from "./convex-link";
import { isConvexNodeModulesHoisted } from "./convex-node-modules";

type Check = {
  name: string;
  ok: boolean;
  detail: string;
  remediation?: string;
  deferUntilConvex?: boolean;
  optional?: boolean;
};

function fileExists(root: string, rel: string): boolean {
  return existsSync(resolve(root, rel));
}

function readEnvFile(root: string, relPath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fileExists(root, relPath)) {
    return out;
  }
  const raw = readFileSync(resolve(root, relPath), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) {
      out[m[1]!] = parseDotenvAssignmentValue(m[2]!);
    }
  }
  return out;
}

function parseNodeMajor(version: string): number | null {
  const m = version.replace(/^v/, "").match(/^(\d+)/);
  return m ? Number(m[1]) : null;
}

function parseSemverTriple(version: string): [number, number, number] | null {
  const m = version.replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) {
    return null;
  }
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/**
 * Returns whether the running Bun version matches the repo pin in `.bun-version`.
 *
 * @param current - Running Bun version (e.g. `1.3.14`)
 * @param wanted - Contents of `.bun-version`
 */
function bunVersionMatches(current: string, wanted: string): boolean {
  const currentParts = parseSemverTriple(current);
  const wantedParts = parseSemverTriple(wanted);
  if (!currentParts || !wantedParts) {
    return current.trim() === wanted.trim();
  }
  return (
    currentParts[0] === wantedParts[0] &&
    currentParts[1] === wantedParts[1] &&
    currentParts[2] === wantedParts[2]
  );
}

function buildChecks(root: string): Check[] {
  const checks: Check[] = [];

  const readBunVersion = (): string | null => {
    const path = resolve(root, ".bun-version");
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf8").trim();
  };

  const readNodeVersion = (): string | null => {
    const path = resolve(root, ".node-version");
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf8").trim();
  };

  const wantedBun = readBunVersion();
  const runningUnderBun = typeof Bun !== "undefined";
  const bunOk =
    runningUnderBun &&
    (!wantedBun || bunVersionMatches(Bun.version, wantedBun));

  checks.push({
    name: "Bun",
    ok: bunOk,
    detail: !runningUnderBun
      ? "not running under Bun"
      : bunOk
        ? `bun ${Bun.version} (want ${wantedBun ?? ">=1.3.14"})`
        : `bun ${Bun.version} — want ${wantedBun} from .bun-version`,
    remediation: !runningUnderBun
      ? "Install Bun from https://bun.sh and re-run `bun run setup`"
      : wantedBun
        ? `Install Bun ${wantedBun} (see .bun-version) and re-run \`bun run setup\``
        : "Install Bun from https://bun.sh and re-run `bun run setup`",
  });

  const wantedNode = readNodeVersion();
  const currentNodeMajor = parseNodeMajor(process.version);
  const wantedNodeMajor = wantedNode ? parseNodeMajor(wantedNode) : null;
  const nodeOk = !wantedNodeMajor || currentNodeMajor === wantedNodeMajor;

  checks.push({
    name: "Node",
    ok: nodeOk,
    detail: nodeOk
      ? `v${currentNodeMajor ?? "?"} (want ${wantedNode ?? "24"} from .node-version)`
      : `v${currentNodeMajor ?? "?"} — want ${wantedNode} from .node-version`,
    remediation: nodeOk
      ? undefined
      : "Install the Node version in .node-version (see engines in package.json)",
  });

  checks.push({
    name: "apps/web/.env.local",
    ok: fileExists(root, "apps/web/.env.local"),
    detail: fileExists(root, "apps/web/.env.local") ? "present" : "missing",
    remediation:
      "bun run setup  # or: cp apps/web/.env.example apps/web/.env.local",
  });

  const rootEnv = readEnvFile(root, ".env.local");
  const convexDeployment = rootEnv.CONVEX_DEPLOYMENT;
  const convexLinked = isConvexLinked(root);

  checks.push({
    name: "Root .env.local (Convex)",
    ok: convexLinked,
    detail: convexLinked
      ? "linked"
      : fileExists(root, ".env.local")
        ? "present but not linked — expected until you run dev:convex"
        : "not linked yet — expected until you run dev:convex",
    remediation: "bun run dev:convex — docs/getting-started.md",
    deferUntilConvex: true,
  });

  const convexNodeModulesHoisted = isConvexNodeModulesHoisted(root);
  checks.push({
    name: "convex/node_modules",
    ok: convexNodeModulesHoisted,
    detail: convexNodeModulesHoisted
      ? "hoisted (symlinks)"
      : "copied packages — Convex deploy will fail",
    remediation:
      "rm -rf convex/node_modules && bun install  # from repo root only",
  });

  const hasAuthConfig = fileExists(root, "convex/auth.config.ts");
  checks.push({
    name: "convex/auth.config.ts",
    ok: hasAuthConfig,
    detail: hasAuthConfig ? "present" : "missing",
    remediation:
      "restore convex/auth.config.ts from the template (committed in repo)",
  });

  const hasConvexGenerated = fileExists(root, "convex/_generated/api.d.ts");

  checks.push({
    name: "Generated code (Convex)",
    ok: hasConvexGenerated,
    detail: hasConvexGenerated ? "convex/_generated present" : "missing",
    remediation: "bun run dev:convex  # or: bun scripts/generate-convex.ts",
    deferUntilConvex: true,
  });

  checks.push({
    name: "Convex agent skills",
    ok: fileExists(root, ".agents/skills/convex/SKILL.md"),
    detail: fileExists(root, ".agents/skills/convex/SKILL.md")
      ? ".agents/ present"
      : "missing",
    remediation: "bunx convex ai-files install",
    optional: true,
  });

  const clerkSkillsOk = areClerkAgentSkillsInstalled(root);
  checks.push({
    name: "Clerk agent skills",
    ok: clerkSkillsOk,
    detail: clerkSkillsOk
      ? "clerk-react-patterns, clerk-testing, clerk-backend-api"
      : "missing",
    remediation:
      "bun run setup  # or: bunx skills add clerk/skills -y -a cursor --skill clerk-react-patterns --skill clerk-testing --skill clerk-backend-api",
    optional: true,
  });

  const webEnv = readEnvFile(root, "apps/web/.env.local");
  const convexUrl = readConvexUrlFromWebEnv(webEnv);
  const clerkKey = readClerkPublishableKey(webEnv);
  const backendConfigured =
    !isPlaceholderEnvValue(convexUrl) && !isPlaceholderEnvValue(clerkKey);

  checks.push({
    name: "Backend (Convex + Clerk env)",
    ok: backendConfigured,
    detail: backendConfigured
      ? "PUBLIC_CONVEX_URL and PUBLIC_CLERK_PUBLISHABLE_KEY set"
      : convexLinked
        ? "placeholders or missing in apps/web/.env.local"
        : "PUBLIC_CONVEX_URL pending — resume `bun run setup` to link Convex and sync env",
    remediation: "bun run setup — docs/getting-started.md",
    deferUntilConvex: true,
  });

  if (convexDeployment && !isRealConvexDeployment(convexDeployment)) {
    checks.push({
      name: "CONVEX_DEPLOYMENT",
      ok: false,
      detail: "root .env.local still has a template value",
      remediation: "bun run dev:convex",
      deferUntilConvex: true,
    });
  }

  const e2eEmail = process.env.E2E_USER_EMAIL ?? webEnv.E2E_USER_EMAIL;
  const e2eSecret = process.env.CLERK_SECRET_KEY ?? webEnv.CLERK_SECRET_KEY;
  checks.push({
    name: "E2E tasks (optional)",
    ok: Boolean(e2eSecret && e2eEmail && !isPlaceholderE2eEmail(e2eEmail)),
    detail:
      e2eSecret && e2eEmail
        ? "CLERK_SECRET_KEY + E2E_USER_EMAIL set"
        : "not configured",
    remediation:
      "Run `bun run setup` to provision E2E user, or set vars in apps/web/.env.local — docs/development.md",
    optional: true,
  });

  return checks;
}

function isBlocking(check: Check, convexLinked: boolean): boolean {
  if (check.ok || check.optional) {
    return false;
  }
  if (check.deferUntilConvex && !convexLinked) {
    return false;
  }
  return true;
}

/**
 * Prints readiness checks and returns a process exit code.
 *
 * @param root - Repository root
 * @returns 0 when blocking checks pass, 1 otherwise
 */
export function runReadiness(root: string): number {
  const convexLinked = isConvexLinked(root);
  const checks = buildChecks(root);

  for (const check of checks) {
    const icon = check.ok ? "✓" : "○";
    console.log(`${icon} ${check.name}: ${check.detail}`);
    if (!check.ok && check.remediation) {
      console.log(`    → ${check.remediation}`);
    }
  }

  const blocking = checks.filter((c) => isBlocking(c, convexLinked));
  if (blocking.length > 0) {
    console.log("\nDocs: docs/getting-started.md");
    return 1;
  }
  return 0;
}
