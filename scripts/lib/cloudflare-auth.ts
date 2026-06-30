/* eslint-disable no-console -- CLI wizard */
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { resolveCloudflareAccountId } from "./cloudflare-api";
import { readEnvFile, upsertEnvKeys } from "./env-file";
import { printManualAction } from "./manual-action";
import { openUrlInBrowser } from "./open-url";
import { CLOUDFLARE_API_TOKENS } from "./platform-urls";
import { promptSecret } from "./prompt";
import { readSetupConfig } from "./setup-config";
import { readSpawnPipe } from "./spawn-io";

/** Minimum length for a Cloudflare User API token (dashboard tokens are ~40 chars). */
const CLOUDFLARE_API_TOKEN_MIN_LENGTH = 37;

/** Maximum plausible length for a Cloudflare User API token. */
const CLOUDFLARE_API_TOKEN_MAX_LENGTH = 256;

/**
 * Validates a Cloudflare User API token pasted or read from the environment.
 *
 * @param value - Raw API token
 */
export function validateCloudflareApiToken(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) {
    return "Cloudflare API token is required";
  }
  if (normalized.length < CLOUDFLARE_API_TOKEN_MIN_LENGTH) {
    return "Token looks too short — copy the full API token from Cloudflare";
  }
  if (normalized.length > CLOUDFLARE_API_TOKEN_MAX_LENGTH) {
    return "Token looks too long for a Cloudflare API token";
  }
  if (normalized.startsWith("pk_") || normalized.startsWith("sk_")) {
    return "That looks like a Clerk key — paste your Cloudflare API token";
  }
  if (normalized.startsWith("whsec_")) {
    return "That looks like a Clerk webhook signing secret — paste your Cloudflare API token";
  }
  if (normalized.startsWith("GOCSPX-")) {
    return "That looks like a Google OAuth client secret — paste your Cloudflare API token";
  }
  if (normalized.includes(".apps.googleusercontent.com")) {
    return "That looks like a Google OAuth client ID — paste your Cloudflare API token";
  }
  if (!/^[A-Za-z0-9._-]+$/.test(normalized)) {
    return "Cloudflare API tokens use letters, numbers, dashes, underscores, and dots";
  }
  return null;
}

export type WranglerWhoami = {
  accountId?: string;
};

export type ResolvedCloudflareToken = {
  token: string;
  source: "env" | "local" | "wrangler_oauth" | "prompt";
};

/** Gitignored local store for a long-lived Cloudflare API token (setup + DNS sync). */
export const CLOUDFLARE_LOCAL_ENV = ".svelter/cloudflare.env";

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
 * Reads a long-lived Cloudflare API token saved by a prior interactive setup run.
 *
 * @param root - Repository root
 */
export function readPersistedCloudflareApiToken(
  root: string,
): ResolvedCloudflareToken | null {
  const token = readEnvFile(
    root,
    CLOUDFLARE_LOCAL_ENV,
  ).CLOUDFLARE_API_TOKEN?.trim();
  if (!token || validateCloudflareApiToken(token)) {
    return null;
  }
  return { token, source: "local" };
}

/**
 * Saves a long-lived Cloudflare API token for reuse across setup runs.
 *
 * @param root - Repository root
 * @param token - Long-lived User API token
 */
export function persistCloudflareApiToken(root: string, token: string): void {
  const trimmed = token.trim();
  if (!trimmed || validateCloudflareApiToken(trimmed)) {
    return;
  }
  mkdirSync(resolve(root, ".svelter"), { recursive: true });
  upsertEnvKeys(root, CLOUDFLARE_LOCAL_ENV, {
    CLOUDFLARE_API_TOKEN: trimmed,
  });
}

/**
 * Remembers a pasted token for this process and persists it locally.
 *
 * @param root - Repository root
 * @param token - Long-lived User API token
 */
export function storeCloudflareApiToken(root: string, token: string): void {
  rememberCloudflareApiTokenForSession(token);
  persistCloudflareApiToken(root, token);
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
    "Click **Create Token** → **Create Custom Token**",
    `Set Token name: e.g. "${name} GitHub Actions"`,
    "Under **Permissions**, add each row:",
    "  • Account → Cloudflare Pages → **Edit**",
    "  • Account → Account Settings → **Edit**",
    "  • Zone → Zone → **Edit**",
    "  • Zone → DNS → **Edit**",
    "Under **Account Resources** → Include → select your Cloudflare account",
    "Under **Zone Resources** → Include → **All zones** (required before the zone exists)",
    "Click **Continue to summary** → **Create Token** → copy the token (shown once)",
    "Paste the token at the prompt below (input is hidden)",
    "Or skip the token: Dashboard → **Domains** → **Add a domain** (same as creating a zone in the UI)",
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
    "Log in at your domain registrar (where you bought the domain — e.g. OVH, Namecheap, Gandi)",
    "Open your apex domain's management page",
    "Go to **Nameservers**, **DNS servers**, or **Delegation** (label varies by registrar)",
    "Switch from the registrar's default nameservers to **Custom nameservers** (or equivalent)",
    "If **DNSSEC** is enabled at your registrar (common on OVH), disable it before changing nameservers — otherwise delegation can fail or stay stuck on pending",
    `Set nameservers to Cloudflare's values exactly: ${joined}`,
    "Click **Save** — after this, manage DNS only in Cloudflare (not at the registrar)",
    "After Cloudflare shows the zone **Active**, optionally enable DNSSEC in Cloudflare → **DNS** → **Settings** (not at the registrar)",
    "Before switching: copy any email MX/TXT records into Cloudflare DNS if you use email on this domain",
    "Wait for propagation (minutes to 48 hours) — re-run `bun run setup` when Cloudflare shows the zone **Active**",
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
  const fromEnv = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (fromEnv && !validateCloudflareApiToken(fromEnv)) {
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
  const fromEnv = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (fromEnv && !validateCloudflareApiToken(fromEnv)) {
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
    label: "CLOUDFLARE_API_TOKEN",
    hint: "Copy from the Cloudflare dashboard after Create Token — then paste below.",
    validate: validateCloudflareApiToken,
  });
  const trimmed = pasted.trim();
  if (trimmed) {
    storeCloudflareApiToken(root, trimmed);
    console.log(`✓ Saved CLOUDFLARE_API_TOKEN → ${CLOUDFLARE_LOCAL_ENV}`);
    return { token: trimmed, source: "prompt" };
  }
  return null;
}

/**
 * Resolves a Cloudflare API token for setup and GitHub Actions secrets.
 *
 * Order: `CLOUDFLARE_API_TOKEN` env → session paste → `.svelter/cloudflare.env` →
 * (`wrangler login` OAuth when allowed) → interactive paste.
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
    const tokenError = validateCloudflareApiToken(fromEnv);
    if (!tokenError) {
      return { token: fromEnv, source: "env" };
    }
    console.log(
      `○ Invalid CLOUDFLARE_API_TOKEN in environment — ${tokenError}`,
    );
  }

  const session = getSessionCloudflareApiToken();
  if (session) {
    return session;
  }

  const persisted = readPersistedCloudflareApiToken(root);
  if (persisted) {
    return persisted;
  }

  if (!options?.durableOnly) {
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
