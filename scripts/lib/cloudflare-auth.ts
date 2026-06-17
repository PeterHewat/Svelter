/* eslint-disable no-console -- CLI wizard */
import { resolveCloudflareAccountId } from "./cloudflare-api";
import { CLOUDFLARE_API_TOKENS, CLOUDFLARE_SIGN_UP } from "./platform-urls";
import { openUrlInBrowser } from "./open-url";
import { printManualAction } from "./manual-action";
import { promptSecret } from "./prompt";
import { readSpawnPipe } from "./spawn-io";

export type WranglerWhoami = {
  accountId?: string;
};

export type ResolvedCloudflareToken = {
  token: string;
  source: "env" | "wrangler_oauth" | "prompt";
};

const WRANGLER_COMMAND = ["bunx", "wrangler"] as const;

/**
 * Runs a wrangler subcommand from the repository root.
 *
 * @param root - Repository root
 * @param args - Wrangler arguments after `wrangler`
 */
async function runWrangler(
  root: string,
  args: string[],
): Promise<{ ok: boolean; stdout: string; stderr: string; code: number }> {
  const proc = Bun.spawn([...WRANGLER_COMMAND, ...args], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    readSpawnPipe(proc.stdout),
    readSpawnPipe(proc.stderr),
    proc.exited,
  ]);
  return { ok: code === 0, stdout, stderr, code };
}

/**
 * Parses `wrangler whoami --json` (exit code is unreliable when logged out).
 *
 * @param stdout - Raw JSON stdout
 */
export function parseWranglerWhoamiJson(stdout: string): {
  loggedIn: boolean;
  accountId?: string;
} {
  try {
    const json = JSON.parse(stdout) as {
      loggedIn?: boolean;
      accounts?: Array<{ id?: string }>;
      account?: { id?: string };
    };
    if (json.loggedIn === false) {
      return { loggedIn: false };
    }
    const accountId = json.accounts?.[0]?.id ?? json.account?.id;
    return {
      loggedIn: json.loggedIn === true || Boolean(accountId),
      accountId,
    };
  } catch {
    return { loggedIn: false };
  }
}

/**
 * Whether Wrangler has a usable OAuth session or `CLOUDFLARE_API_TOKEN`.
 *
 * @param root - Repository root
 */
export async function isWranglerAuthenticated(root: string): Promise<boolean> {
  if (process.env.CLOUDFLARE_API_TOKEN?.trim()) {
    return true;
  }
  const result = await runWrangler(root, ["whoami", "--json"]);
  const parsed = parseWranglerWhoamiJson(result.stdout);
  return parsed.loggedIn;
}

/**
 * Parses account id from `wrangler whoami --json` output.
 *
 * @param stdout - Raw JSON stdout
 */
export function parseWranglerWhoami(stdout: string): WranglerWhoami {
  const { accountId } = parseWranglerWhoamiJson(stdout);
  return accountId ? { accountId } : {};
}

/**
 * Resolves Cloudflare account id from env, Wrangler, or API.
 *
 * @param root - Repository root
 * @param token - API or OAuth token for API fallback
 */
export async function resolveWranglerAccountId(
  root: string,
  token?: string,
): Promise<string | undefined> {
  const fromEnv = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  const whoami = await runWrangler(root, ["whoami", "--json"]);
  const parsed = parseWranglerWhoamiJson(whoami.stdout);
  if (parsed.loggedIn && parsed.accountId) {
    return parsed.accountId;
  }
  if (token) {
    try {
      return await resolveCloudflareAccountId(token);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Parses a token from `wrangler auth token --json`.
 *
 * @param stdout - Raw JSON stdout
 */
export function parseWranglerAuthTokenJson(stdout: string): string | undefined {
  try {
    const json = JSON.parse(stdout) as { token?: string; apiToken?: string };
    return json.token?.trim() || json.apiToken?.trim() || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Runs interactive `wrangler login` when no API token is in the environment.
 *
 * @param root - Repository root
 */
export async function ensureWranglerLogin(root: string): Promise<boolean> {
  if (process.env.CLOUDFLARE_API_TOKEN?.trim()) {
    return true;
  }
  if (await isWranglerAuthenticated(root)) {
    return true;
  }
  console.log("\n→ Cloudflare — running `bunx wrangler login` (browser OAuth)");
  const proc = Bun.spawn([...WRANGLER_COMMAND, "login"], {
    cwd: root,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  return (await proc.exited) === 0;
}

/**
 * Resolves a Cloudflare API token for setup and GitHub Actions secrets.
 *
 * Order: `CLOUDFLARE_API_TOKEN` env → `wrangler login` + `wrangler auth token` → paste.
 *
 * @param root - Repository root
 */
export async function resolveCloudflareApiToken(
  root: string,
): Promise<ResolvedCloudflareToken | null> {
  const fromEnv = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (fromEnv) {
    return { token: fromEnv, source: "env" };
  }

  const loggedIn = await ensureWranglerLogin(root);
  if (loggedIn) {
    const authToken = await runWrangler(root, ["auth", "token", "--json"]);
    const oauthToken = authToken.ok
      ? parseWranglerAuthTokenJson(authToken.stdout)
      : undefined;
    if (oauthToken) {
      console.log("✓ Cloudflare token — `wrangler login` session");
      return { token: oauthToken, source: "wrangler_oauth" };
    }
  }

  printManualAction("Create a Cloudflare API token for GitHub Actions", [
    `Sign up or sign in: ${CLOUDFLARE_SIGN_UP}`,
    `API Tokens: ${CLOUDFLARE_API_TOKENS}`,
    "Permissions: Account → Cloudflare Pages → Edit; Account → Account Settings → Read",
    "Zone → Zone → Edit; Zone → DNS → Edit (all zones)",
  ]);
  await openUrlInBrowser(CLOUDFLARE_API_TOKENS);
  const pasted = await promptSecret("Paste your Cloudflare API token", {
    required: true,
  });
  const trimmed = pasted.trim();
  return trimmed ? { token: trimmed, source: "prompt" } : null;
}
