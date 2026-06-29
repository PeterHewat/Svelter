/* eslint-disable no-console -- CLI wizard */
import { resolveCloudflareAccountId } from "./cloudflare-api";
import { printManualAction } from "./manual-action";
import { openUrlInBrowser } from "./open-url";
import { CLOUDFLARE_API_TOKENS } from "./platform-urls";
import { promptSecret } from "./prompt";
import { readSetupConfig } from "./setup-config";
import { readSpawnPipe } from "./spawn-io";

export type WranglerWhoami = {
  accountId?: string;
};

export type ResolvedCloudflareToken = {
  token: string;
  source: "env" | "wrangler_oauth" | "prompt";
};

export type ResolveCloudflareApiTokenOptions = {
  /** Require env or pasted long-lived token — skip `wrangler login` OAuth (CI secrets). */
  durableOnly?: boolean;
  /** Allow interactive paste; default `stdin.isTTY`. */
  interactive?: boolean;
};

/** Pasted durable token reused for the rest of a single `bun run setup` process. */
let sessionCloudflareApiToken: string | undefined;

/**
 * Stores a pasted Cloudflare API token for reuse in the same setup run.
 *
 * @param token - Long-lived User API token
 */
export function rememberCloudflareApiTokenForSession(token: string): void {
  const trimmed = token.trim();
  if (trimmed) {
    sessionCloudflareApiToken = trimmed;
  }
}

/**
 * Returns a durable token pasted earlier in this setup run, if any.
 */
export function getSessionCloudflareApiToken(): ResolvedCloudflareToken | null {
  if (!sessionCloudflareApiToken) {
    return null;
  }
  return { token: sessionCloudflareApiToken, source: "prompt" };
}

/**
 * Clears the in-memory setup session token (tests).
 */
export function clearSessionCloudflareApiToken(): void {
  sessionCloudflareApiToken = undefined;
}

/**
 * Step-by-step bullets for creating a User API token in the Cloudflare dashboard.
 *
 * Includes Zone/DNS permissions so the same token works for CI deploys and later
 * custom-domain bootstrap — no second token when you add an apex domain.
 *
 * @param productName - Product name from setup (e.g. for suggested token label)
 */
export function cloudflareApiTokenManualSteps(productName?: string): string[] {
  const name = productName?.trim() || "My App";
  return [
    `Open ${CLOUDFLARE_API_TOKENS}`,
    "Create Token → Create Custom Token",
    `Token name: e.g. "${name} GitHub Actions" (any descriptive label)`,
    "Permissions — Account → Cloudflare Pages → Edit",
    "Permissions — Account → Account Settings → Edit",
    "Permissions — Zone → Zone → Edit",
    "Permissions — Zone → DNS → Edit",
    "Account Resources — Include → select your Cloudflare account",
    "Zone Resources — Include → All zones (required before the zone exists)",
    "Create Token → copy the value (shown once)",
    "Return here and paste the token at the prompt below (input is hidden)",
    "Or skip the token: use Dashboard → Add a domain (same as creating a zone in the UI)",
  ];
}

/**
 * Generic registrar steps for delegating DNS to Cloudflare nameservers.
 *
 * Wording varies by registrar (OVH, Namecheap, GoDaddy, etc.) — these steps
 * describe the task, not a single vendor UI.
 *
 * @param nameservers - Cloudflare-assigned nameservers for the zone
 */
export function registrarNameserverManualSteps(
  nameservers: string[],
): string[] {
  const joined = nameservers.join(", ");
  return [
    "Log in where you registered the domain (your registrar — e.g. OVH, Namecheap, Gandi)",
    "Open the domain management page for your apex domain",
    'Find "Nameservers", "DNS servers", or "Delegation" (labels differ by registrar)',
    'Switch from the registrar\'s default DNS to "Custom nameservers" (or equivalent)',
    `Enter Cloudflare's nameservers exactly: ${joined}`,
    "Save — do not change individual DNS records at the registrar after this; manage DNS in Cloudflare",
    "Copy any email MX/TXT records into Cloudflare DNS before switching if you use email on this domain",
    "Propagation can take minutes to 48 hours; re-run `bun run setup` when Cloudflare shows the zone Active",
  ];
}

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
 * Interactive paste flow for a long-lived Cloudflare User API token.
 *
 * @param root - Repository root
 */
async function promptForDurableCloudflareApiToken(
  root: string,
): Promise<ResolvedCloudflareToken | null> {
  printManualAction(
    "Create a Cloudflare API token for GitHub Actions",
    cloudflareApiTokenManualSteps(readSetupConfig(root)?.productName),
    { immediate: true },
  );
  await openUrlInBrowser(CLOUDFLARE_API_TOKENS);
  const pasted = await promptSecret("Paste your Cloudflare API token here", {
    required: true,
    hint: "Copy from the Cloudflare dashboard after Create Token — then paste below.",
  });
  const trimmed = pasted.trim();
  if (trimmed) {
    rememberCloudflareApiTokenForSession(trimmed);
    return { token: trimmed, source: "prompt" };
  }
  return null;
}

/**
 * Resolves a Cloudflare API token for setup and GitHub Actions secrets.
 *
 * Order: `CLOUDFLARE_API_TOKEN` env → (`wrangler login` OAuth when allowed) → paste.
 *
 * @param root - Repository root
 * @param options - `durableOnly` for CI secret sync (skips short-lived OAuth tokens)
 */
export async function resolveCloudflareApiToken(
  root: string,
  options?: ResolveCloudflareApiTokenOptions,
): Promise<ResolvedCloudflareToken | null> {
  const fromEnv = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (fromEnv) {
    return { token: fromEnv, source: "env" };
  }

  if (options?.durableOnly) {
    const session = getSessionCloudflareApiToken();
    if (session) {
      return session;
    }
  }

  if (!options?.durableOnly) {
    const session = getSessionCloudflareApiToken();
    if (session) {
      return session;
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
  }

  const interactive = options?.interactive ?? Boolean(process.stdin.isTTY);
  if (!interactive) {
    console.log(
      "○ CLOUDFLARE_API_TOKEN required for CI — export it or run setup interactively",
    );
    return null;
  }

  if (options?.durableOnly) {
    console.log(
      "  `wrangler login` tokens expire — GitHub Actions needs a long-lived API token.",
    );
  }

  return promptForDurableCloudflareApiToken(root);
}
