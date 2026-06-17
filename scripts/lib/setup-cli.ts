/* eslint-disable no-console -- CLI wizard */
import { bunWorkspaceCliInstallHint, ghInstallHint } from "./cli-install-hints";
import { isWranglerAuthenticated } from "./cloudflare-auth";
import { promptConfirm } from "./prompt";
import { isGhAuthenticated, isGhInstalled } from "./gh-secrets";
import { readSpawnPipe } from "./spawn-io";

/** Status of one external CLI used during setup. */
export type CliToolState = {
  /** Binary or `bunx` shim is available. */
  installed: boolean;
  /** Parsed version string when installed. */
  version?: string;
  /** Whether an interactive login session exists (when applicable). */
  authenticated: boolean;
  /** Human-readable install hint when missing. */
  installHint: string;
  /** argv prefix to invoke this tool (e.g. `["gh"]` or `["bunx", "convex"]`). */
  command: string[];
};

/** CLI readiness discovered at the start of interactive setup. */
export type SetupCliContext = {
  /** User chose to continue with manual dashboard steps despite missing tools. */
  manualMode: boolean;
  gh: CliToolState;
  convex: CliToolState;
  wrangler: CliToolState;
  clerk: CliToolState;
};

/**
 * Returns whether a spawn error means the executable is missing from PATH.
 *
 * @param error - Caught spawn error
 */
function isMissingExecutableError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ENOENT"
  );
}

/**
 * Runs a command and captures stdout (trimmed).
 *
 * @param command - Executable and arguments
 * @param options - Optional working directory
 */
async function runCapture(
  command: string[],
  options?: { cwd?: string },
): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  let proc: ReturnType<typeof Bun.spawn>;
  try {
    proc = Bun.spawn(command, {
      cwd: options?.cwd,
      stdout: "pipe",
      stderr: "pipe",
    });
  } catch (error) {
    if (isMissingExecutableError(error)) {
      return { ok: false, stdout: "", stderr: "" };
    }
    throw error;
  }
  const code = await proc.exited;
  const stdout = await readSpawnPipe(proc.stdout);
  const stderr = await readSpawnPipe(proc.stderr);
  return { ok: code === 0, stdout, stderr };
}

/**
 * Merges captured stdout and stderr (some CLIs log status to stderr only).
 *
 * @param capture - Result from {@link runCapture}
 */
export function mergeCaptureOutput(capture: {
  stdout: string;
  stderr: string;
}): string {
  return [capture.stdout, capture.stderr].filter(Boolean).join("\n");
}

/**
 * Extracts a short version token from CLI `--version` output.
 *
 * @param stdout - Raw stdout from the version command
 */
export function parseCliVersion(stdout: string): string | undefined {
  const trimmed = stdout.trim();
  if (!trimmed) {
    return undefined;
  }
  const ghMatch = trimmed.match(/gh version\s+(\S+)/i);
  if (ghMatch?.[1]) {
    return ghMatch[1];
  }
  const wranglerMatch = trimmed.match(/wrangler\s+(\S+)/i);
  if (wranglerMatch?.[1]) {
    return wranglerMatch[1];
  }
  const clerkMatch = trimmed.match(/clerk(?: CLI)?\s+v?(\d+\.\S+)/i);
  if (clerkMatch?.[1]) {
    return clerkMatch[1];
  }
  const convexMatch = trimmed.match(/convex(?: CLI)?\s+v?(\d+\.\S+)/i);
  if (convexMatch?.[1]) {
    return convexMatch[1];
  }
  const firstLine = trimmed.split(/\r?\n/, 1)[0]?.trim();
  if (!firstLine) {
    return undefined;
  }
  const token = firstLine.split(/\s+/).find((part) => /\d/.test(part));
  return token ?? firstLine;
}

/**
 * Probes a CLI binary for `--version`.
 *
 * @param command - Executable and arguments (e.g. `["gh", "--version"]`)
 * @param options - Optional working directory
 */
async function probeVersion(
  command: string[],
  options?: { cwd?: string },
): Promise<{ installed: boolean; version?: string }> {
  const { ok, stdout } = await runCapture(command, options);
  if (!ok) {
    return { installed: false };
  }
  return { installed: true, version: parseCliVersion(stdout) };
}

/**
 * Probes a repo-pinned CLI invoked via `bunx` (devDependency in root `package.json`).
 *
 * @param root - Repository root
 * @param binary - CLI binary name (`convex`, `wrangler`, `clerk`)
 */
async function probeBunxWorkspaceCli(
  root: string,
  binary: string,
): Promise<{ installed: boolean; version?: string; command: string[] }> {
  const command = ["bunx", binary];
  const workspace = await probeVersion([...command, "--version"], {
    cwd: root,
  });
  return { ...workspace, command };
}

/**
 * Returns whether Convex CLI is logged in (`convex login status`).
 *
 * @param command - argv prefix for Convex
 * @param root - Repository root
 */
async function isConvexAuthenticated(
  command: string[],
  root: string,
): Promise<boolean> {
  const capture = await runCapture([...command, "login", "status"], {
    cwd: root,
  });
  const output = mergeCaptureOutput(capture);
  return capture.ok && /logged in|previously been authorized/i.test(output);
}

/**
 * Returns GitHub CLI install and auth status.
 */
async function probeGh(): Promise<CliToolState> {
  const installed = await isGhInstalled();
  if (!installed) {
    return {
      installed: false,
      authenticated: false,
      installHint: ghInstallHint(),
      command: ["gh"],
    };
  }
  const { version } = await probeVersion(["gh", "--version"]);
  const authenticated = await isGhAuthenticated();
  return {
    installed: true,
    version,
    authenticated,
    installHint: ghInstallHint(),
    command: ["gh"],
  };
}

/**
 * Returns Convex CLI availability (workspace `bunx` or global binary) and login status.
 *
 * @param root - Repository root
 */
async function probeConvex(root: string): Promise<CliToolState> {
  const resolved = await probeBunxWorkspaceCli(root, "convex");
  if (!resolved.installed) {
    return {
      installed: false,
      authenticated: false,
      installHint: bunWorkspaceCliInstallHint(
        "convex",
        "https://docs.convex.dev/cli",
      ),
      command: resolved.command,
    };
  }
  return {
    installed: true,
    version: resolved.version,
    authenticated: await isConvexAuthenticated(resolved.command, root),
    installHint: bunWorkspaceCliInstallHint(
      "convex",
      "https://docs.convex.dev/cli",
    ),
    command: resolved.command,
  };
}

/**
 * Returns Wrangler CLI availability (repo `bunx wrangler`) and auth status.
 *
 * @param root - Repository root
 */
async function probeWrangler(root: string): Promise<CliToolState> {
  const resolved = await probeBunxWorkspaceCli(root, "wrangler");
  const installHint = bunWorkspaceCliInstallHint(
    "wrangler",
    "https://developers.cloudflare.com/workers/wrangler/",
  );
  if (!resolved.installed) {
    return {
      installed: false,
      authenticated: Boolean(process.env.CLOUDFLARE_API_TOKEN?.trim()),
      installHint,
      command: resolved.command,
    };
  }
  return {
    installed: true,
    version: resolved.version,
    authenticated: await isWranglerAuthenticated(root),
    installHint,
    command: resolved.command,
  };
}

/**
 * Returns Clerk CLI availability (repo `bunx clerk`) and auth status.
 *
 * @param root - Repository root
 */
async function probeClerk(root: string): Promise<CliToolState> {
  const resolved = await probeBunxWorkspaceCli(root, "clerk");
  if (!resolved.installed) {
    return {
      installed: false,
      authenticated: false,
      installHint: bunWorkspaceCliInstallHint(
        "clerk",
        "https://clerk.com/docs/cli",
      ),
      command: resolved.command,
    };
  }
  const whoami = await runCapture([...resolved.command, "whoami"], {
    cwd: root,
  });
  return {
    installed: true,
    version: resolved.version,
    authenticated: whoami.ok,
    installHint: bunWorkspaceCliInstallHint(
      "clerk",
      "https://clerk.com/docs/cli",
    ),
    command: resolved.command,
  };
}

/**
 * Whether setup can automate GitHub Actions secret sync via `gh`.
 *
 * @param authenticated - Whether the tool session is ready
 */
export function formatCliAuthStatus(authenticated: boolean): string {
  return authenticated ? "logged in" : "NOT logged in";
}

function printToolLine(label: string, state: CliToolState): void {
  if (!state.installed) {
    console.log(`○ ${label} — not found`);
    console.log(`    Install: ${state.installHint}`);
    return;
  }
  const version = state.version ? ` v${state.version}` : "";
  const marker = state.authenticated ? "✓" : "○";
  console.log(
    `${marker} ${label}${version} — ${formatCliAuthStatus(state.authenticated)}`,
  );
}

/**
 * Runs an interactive CLI login when the tool is installed but not authenticated.
 *
 * @param label - Display name
 * @param command - Login command (stdin inherited)
 */
async function ensureInteractiveLogin(
  label: string,
  command: string[],
): Promise<boolean> {
  console.log(`\n→ ${label} — running \`${command.join(" ")}\``);
  try {
    const proc = Bun.spawn(command, {
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });
    return (await proc.exited) === 0;
  } catch (error) {
    if (isMissingExecutableError(error)) {
      return false;
    }
    throw error;
  }
}

/**
 * Whether setup can automate GitHub Actions secret sync via `gh`.
 *
 * @param ctx - CLI context from {@link runSetupCliPrerequisites}
 */
export function canAutomateGh(ctx: SetupCliContext): boolean {
  return ctx.gh.installed && ctx.gh.authenticated;
}

/**
 * Whether the Clerk CLI is installed and authenticated.
 *
 * @param ctx - CLI context from {@link runSetupCliPrerequisites}
 */
export function canAutomateClerk(ctx: SetupCliContext): boolean {
  return ctx.clerk.installed && ctx.clerk.authenticated;
}

/**
 * Logs in-progress status while a probe runs.
 *
 * @param label - Short status label
 * @param probe - Async probe to await
 */
async function probeWithProgress<T>(
  label: string,
  probe: () => Promise<T>,
): Promise<T> {
  process.stdout.write(`  · ${label}…`);
  try {
    return await probe();
  } finally {
    process.stdout.write("\r\x1b[2K");
  }
}

export async function runSetupCliPrerequisites(
  root: string,
): Promise<SetupCliContext> {
  console.log("CLI prerequisites");
  console.log(
    "  Checking tools (`gh` global; Convex/Wrangler/Clerk via `bunx` from devDependencies)…\n",
  );

  let gh = await probeWithProgress("GitHub CLI (gh)", () => probeGh());
  let convex = await probeWithProgress("Convex CLI", () => probeConvex(root));
  let wrangler = await probeWithProgress("Wrangler CLI", () =>
    probeWrangler(root),
  );
  let clerk = await probeWithProgress("Clerk CLI", () => probeClerk(root));

  const missing: string[] = [];
  if (!gh.installed) {
    missing.push("gh");
  }
  if (!convex.installed) {
    missing.push("convex");
  }
  if (!wrangler.installed) {
    missing.push("wrangler");
  }
  if (!clerk.installed) {
    missing.push("clerk");
  }

  if (gh.installed && !gh.authenticated) {
    const loggedIn = await ensureInteractiveLogin("GitHub CLI", [
      "gh",
      "auth",
      "login",
      "-s",
      "repo,workflow",
    ]);
    if (loggedIn) {
      gh = { ...gh, authenticated: await isGhAuthenticated() };
    }
  }

  if (convex.installed && !convex.authenticated) {
    const loggedIn = await ensureInteractiveLogin("Convex CLI", [
      ...convex.command,
      "login",
    ]);
    if (loggedIn) {
      const verified = await isConvexAuthenticated(convex.command, root);
      convex = { ...convex, authenticated: loggedIn || verified };
    }
  }

  if (
    wrangler.installed &&
    !wrangler.authenticated &&
    !process.env.CLOUDFLARE_API_TOKEN?.trim()
  ) {
    const loggedIn = await ensureInteractiveLogin("Wrangler CLI", [
      ...wrangler.command,
      "login",
    ]);
    if (loggedIn) {
      wrangler = {
        ...wrangler,
        authenticated: await isWranglerAuthenticated(root),
      };
    }
  }

  if (clerk.installed && !clerk.authenticated) {
    const loggedIn = await ensureInteractiveLogin("Clerk CLI", [
      ...clerk.command,
      "auth",
      "login",
    ]);
    if (loggedIn) {
      const whoami = await runCapture([...clerk.command, "whoami"], {
        cwd: root,
      });
      clerk = { ...clerk, authenticated: whoami.ok };
    }
  }

  console.log("");
  printToolLine("GitHub CLI (gh)", gh);
  printToolLine("Convex CLI", convex);
  printToolLine("Wrangler CLI", wrangler);
  printToolLine("Clerk CLI", clerk);

  const gaps =
    missing.length > 0 ||
    (gh.installed && !gh.authenticated) ||
    (convex.installed && !convex.authenticated) ||
    (wrangler.installed &&
      !wrangler.authenticated &&
      !process.env.CLOUDFLARE_API_TOKEN?.trim()) ||
    (clerk.installed && !clerk.authenticated);

  if (gaps) {
    if (missing.length > 0) {
      console.log(
        "\nSome CLIs are missing — automated setup steps will fall back to manual dashboard input.",
      );
    } else {
      console.log(
        "\nSome CLIs still need login — retry the commands above, or continue manually.",
      );
      const retry: string[] = [];
      if (gh.installed && !gh.authenticated) {
        retry.push("gh auth login");
      }
      if (convex.installed && !convex.authenticated) {
        retry.push([...convex.command, "login"].join(" "));
      }
      if (
        wrangler.installed &&
        !wrangler.authenticated &&
        !process.env.CLOUDFLARE_API_TOKEN?.trim()
      ) {
        retry.push([...wrangler.command, "login"].join(" "));
      }
      if (clerk.installed && !clerk.authenticated) {
        retry.push([...clerk.command, "auth", "login"].join(" "));
      }
      if (retry.length > 0) {
        console.log(`  Retry: ${retry.join(" · ")}`);
      }
    }
    const shouldContinue = await promptConfirm(
      "Continue setup with manual steps where automation is unavailable?",
      { defaultYes: true },
    );
    if (!shouldContinue) {
      console.log(
        "Setup stopped — install or log in to the CLIs above, then re-run `bun run setup`.",
      );
      process.exit(0);
    }
    console.log(
      "Continuing — automation will be skipped where tools are unavailable; dashboard URLs are printed instead.",
    );
    return { manualMode: true, gh, convex, wrangler, clerk };
  }

  console.log("\n✓ CLIs ready — setup will use them where possible.");
  return { manualMode: false, gh, convex, wrangler, clerk };
}
