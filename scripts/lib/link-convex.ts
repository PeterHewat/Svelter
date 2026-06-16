/* eslint-disable no-console -- CLI wizard */
import { ensureClaudeAgentsLink } from "./agent-links";
import { isConvexLinked } from "./convex-link";
import { exitWithManualAction, printManualAction } from "./manual-action";
import { CONVEX_DASHBOARD } from "./platform-urls";

export type ConvexDevOnceOptions = {
  configure?: "new" | "existing";
  /** Convex `--project` flag: slug for `existing`, display name for `new`. */
  project?: string;
  stdin?: "inherit" | "ignore";
};

/**
 * Builds `convex dev --once` argv for setup and push helpers.
 *
 * @param options - Configure mode, `--project` value, and stdin handling
 * @returns Args after `bunx` (e.g. `["convex", "dev", "--once", …]`)
 */
export function convexDevOnceArgs(options?: ConvexDevOnceOptions): string[] {
  const args = ["convex", "dev", "--once"];
  if (options?.configure) {
    args.push("--configure", options.configure);
  }
  if (options?.project) {
    args.push("--project", options.project);
  }
  return args;
}

/**
 * Runs `convex dev --once` (configure, codegen, push) from the repo root.
 *
 * @param root - Repository root
 * @param options - Optional configure mode, project slug, and stdin handling
 * @returns Process exit code (0 = success)
 */
async function runConvexDevOnce(
  root: string,
  options?: ConvexDevOnceOptions,
): Promise<number> {
  const args = ["bunx", ...convexDevOnceArgs(options)];
  console.log(`\n→ ${args.slice(1).join(" ")}`);
  const proc = Bun.spawn(args, {
    cwd: root,
    stdin: options?.stdin ?? "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = (await proc.exited) ?? 1;
  ensureClaudeAgentsLink(root);
  return code;
}

/**
 * Whether `convex dev --once` linked a deployment even when the command exited non-zero.
 *
 * On first link, Convex often provisions the dev deployment and writes `.env.local`
 * before failing the push because `CLERK_JWT_ISSUER_DOMAIN` is not set yet.
 *
 * @param root - Repository root
 */
export function convexLinkedAfterDevOnce(root: string): boolean {
  return isConvexLinked(root);
}

/**
 * Logs when a deployment was linked but function push was deferred.
 *
 * @param exitCode - Process exit code from `convex dev --once`
 */
function logDeferredConvexPush(exitCode: number): void {
  if (exitCode !== 0) {
    console.log(
      "○ Convex deployment linked — Clerk issuer sync and function push continue in setup",
    );
  }
}

/**
 * Attempts to link a named existing Convex project without prompting.
 *
 * @param root - Repository root
 * @param projectSlug - Convex project slug (e.g. `my-app`)
 * @returns Whether a deployment is linked and whether function push was deferred
 */
export async function tryLinkExistingConvexProject(
  root: string,
  projectSlug: string,
): Promise<{ linked: boolean; pushDeferred: boolean }> {
  const slug = projectSlug.trim();
  if (!slug) {
    return { linked: false, pushDeferred: false };
  }
  const code = await runConvexDevOnce(root, {
    configure: "existing",
    project: slug,
    stdin: "ignore",
  });
  const linked = convexLinkedAfterDevOnce(root);
  if (linked) {
    logDeferredConvexPush(code);
  }
  return { linked, pushDeferred: linked && code !== 0 };
}

/**
 * Attempts to create and link a new Convex project for the given display name.
 *
 * Convex maps display names to slugs (e.g. `Svelter` → `svelter`). Pass the
 * product name from setup, not a pre-lowercased slug.
 *
 * @param root - Repository root
 * @param projectName - Convex project display name (e.g. `Svelter`)
 * @returns Whether a deployment is linked and whether function push was deferred
 */
export async function tryCreateConvexProject(
  root: string,
  projectName: string,
): Promise<{ linked: boolean; pushDeferred: boolean }> {
  const name = projectName.trim();
  if (!name) {
    return { linked: false, pushDeferred: false };
  }
  const code = await runConvexDevOnce(root, {
    configure: "new",
    project: name,
  });
  const linked = convexLinkedAfterDevOnce(root);
  if (linked) {
    logDeferredConvexPush(code);
  }
  return { linked, pushDeferred: linked && code !== 0 };
}

export type EnsureConvexLinkedOptions = {
  /** When true, Convex CLI is logged in — linking is automated via `convex dev --once`. */
  convexAuthenticated?: boolean;
  /** Product display name from setup (e.g. `Svelter`) — used when creating a project. */
  projectName?: string;
  /** Lowercase slug derived from the product name — used when reusing a project. */
  projectSlug?: string;
};

export type EnsureConvexLinkedResult = {
  linked: boolean;
  /** Function push failed during link (e.g. missing `CLERK_JWT_ISSUER_DOMAIN`) but deployment exists. */
  pushDeferred: boolean;
};

/**
 * Links Convex when the checkout has no deployment yet.
 *
 * When `projectSlug` is set: tries that project first; creates it if missing.
 * Does not fall back to unrelated existing projects in your Convex account.
 *
 * @param root - Repository root
 * @param options - When Convex CLI is already authenticated, skip ACTION REQUIRED copy
 * @returns Whether a deployment is linked and whether function push still needs to run
 */
export async function ensureConvexLinkedInteractive(
  root: string,
  options?: EnsureConvexLinkedOptions,
): Promise<EnsureConvexLinkedResult> {
  if (isConvexLinked(root)) {
    return { linked: true, pushDeferred: false };
  }

  const projectSlug = options?.projectSlug?.trim();
  const projectName = options?.projectName?.trim();

  console.log("\nConvex");
  if (projectSlug) {
    console.log(`  Checking for existing Convex project "${projectSlug}"…`);
    const existing = await tryLinkExistingConvexProject(root, projectSlug);
    if (existing.linked) {
      console.log(`✓ Convex linked (existing project ${projectSlug})`);
      return existing;
    }

    const createName = projectName || projectSlug;
    console.log(
      `○ No existing project "${projectSlug}" — creating "${createName}"…`,
    );
    if (options?.convexAuthenticated) {
      console.log("  Linking via `convex dev --once --configure new`…");
    } else {
      printManualAction("Create Convex project for this repository", [
        `Convex dashboard: ${CONVEX_DASHBOARD}`,
        `Setup runs \`convex dev --once --configure new --project ${createName}\` next`,
        "Complete browser login if prompted",
      ]);
    }

    const created = await tryCreateConvexProject(root, createName);
    if (created.linked) {
      console.log(`✓ Convex linked (new project ${createName})`);
      return created;
    }

    exitWithManualAction("Complete Convex linking", [
      `Convex dashboard: ${CONVEX_DASHBOARD}`,
      `Create or link project "${createName}" manually`,
      "Resume setup: `bun run setup`",
    ]);
  }

  if (options?.convexAuthenticated) {
    console.log("  Linking via `convex dev --once`…");
    console.log(
      "  Prefer **choose an existing project** over creating a duplicate.",
    );
  } else {
    printManualAction("Link Convex to this repository", [
      `Convex dashboard: ${CONVEX_DASHBOARD}`,
      "Setup runs `convex dev --once` next — complete browser login if prompted",
      "Prefer **choose an existing project** when one matches your product name",
    ]);
  }

  let pushDeferred = false;
  let code = await runConvexDevOnce(root, { configure: "existing" });
  if (convexLinkedAfterDevOnce(root)) {
    logDeferredConvexPush(code);
    pushDeferred = code !== 0;
  } else if (code !== 0) {
    code = await runConvexDevOnce(root);
    if (convexLinkedAfterDevOnce(root)) {
      logDeferredConvexPush(code);
      pushDeferred = code !== 0;
    }
  }

  if (!isConvexLinked(root)) {
    exitWithManualAction("Complete Convex linking", [
      `Convex dashboard: ${CONVEX_DASHBOARD}`,
      "Finish browser login and project configuration",
      "Resume setup: `bun run setup`",
    ]);
  }

  console.log("✓ Convex linked");
  return { linked: true, pushDeferred };
}

/**
 * Pushes Convex functions after dashboard env vars change (e.g. CLERK_JWT_ISSUER_DOMAIN).
 *
 * @param root - Repository root
 */
export async function pushConvexDevOnce(root: string): Promise<void> {
  const code = await runConvexDevOnce(root);
  if (code !== 0) {
    console.warn(
      "○ Convex push had errors — retry `bun run dev:convex` for daily development",
    );
    return;
  }
  console.log("✓ Convex functions pushed");
}
