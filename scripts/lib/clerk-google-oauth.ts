/* eslint-disable no-console -- CLI */
import {
  clerkDevelopmentOrigins,
  clerkProductionOrigins,
  deriveProductionHostnames,
  pagesProductionHostname,
} from "../../packages/config/hostnames";
import { normalizeApexDomainInput } from "../../packages/config/validate-domain";
import { isPlaceholderEnvValue } from "../../packages/config/env-placeholders";
import { runClerkConfigPatch } from "./clerk-cli";
import { isClerkSecretKey, normalizeClerkIssuerDomain } from "./clerk-instance";
import { readEnvFile, upsertEnvKeys } from "./env-file";
import { pagesProjectNames } from "./hosting-project-spec";
import { printManualAction } from "./manual-action";
import {
  CLERK_GOOGLE_OAUTH_DOCS,
  CLERK_SSO_CONNECTIONS,
  GOOGLE_CLOUD_CONSOLE,
  GOOGLE_CLOUD_CREDENTIALS,
  GOOGLE_CLOUD_OAUTH_CONSENT,
} from "./platform-urls";
import { productNameToSlug } from "./repo-identity";
import { maskSecret, promptSecret } from "./prompt";
import { normalizeEnvPaste } from "./env-paste";
import type { CliToolState } from "./setup-cli";
import type { SetupConfig } from "./setup-config";
import {
  clerkDashboardInstanceStep,
  type SetupStack,
} from "./setup-stack-labels";

const WEB_ENV = "apps/web/.env.local";

/** Optional setup env keys — credentials are stored in Clerk, not used by the web app. */
export const GOOGLE_OAUTH_CLIENT_ID = "GOOGLE_OAUTH_CLIENT_ID";
export const GOOGLE_OAUTH_CLIENT_SECRET = "GOOGLE_OAUTH_CLIENT_SECRET";

export type GoogleOAuthCredentials = {
  clientId: string;
  clientSecret: string;
};

export type SyncClerkGoogleOAuthResult = {
  connectionEnabled: boolean;
  credentialsConfigured: boolean;
};

/**
 * Clerk OAuth redirect URI for the Google social connection.
 *
 * @param issuerDomain - Clerk JWT issuer / Frontend API URL
 */
export function clerkGoogleOAuthRedirectUri(issuerDomain: string): string {
  const base = normalizeClerkIssuerDomain(issuerDomain).replace(/\/$/, "");
  return `${base}/v1/oauth_callback`;
}

/**
 * Origins to register as **Authorized JavaScript origins** in Google Cloud Console.
 *
 * @param setup - Persisted setup config
 */
export function googleOAuthJavaScriptOrigins(setup: SetupConfig): string[] {
  const { web } = pagesProjectNames(productNameToSlug(setup.productName));
  const origins = [...clerkDevelopmentOrigins(web)];
  // Google One Tap status checks require both bare and port origins on localhost.
  if (!origins.includes("http://localhost")) {
    origins.unshift("http://localhost");
  }
  const prodPages = `https://${pagesProductionHostname(web)}`;
  if (!origins.includes(prodPages)) {
    origins.push(prodPages);
  }
  if (setup.apexDomain?.trim()) {
    for (const origin of clerkProductionOrigins(web, setup.apexDomain)) {
      if (!origins.includes(origin)) {
        origins.push(origin);
      }
    }
  }
  return origins;
}

/**
 * Builds the Clerk CLI config patch to enable Google OAuth with custom credentials.
 *
 * @param credentials - Google OAuth client credentials
 */
export function buildGoogleOAuthConfigPatch(
  credentials: GoogleOAuthCredentials,
): Record<string, unknown> {
  return {
    connection_oauth_google: {
      enabled: true,
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
    },
  };
}

/**
 * Builds a minimal patch that enables Google without custom credentials.
 */
export function buildGoogleOAuthEnablePatch(): Record<string, unknown> {
  return {
    connection_oauth_google: {
      enabled: true,
    },
  };
}

/**
 * Reads Google OAuth credentials from web env or process env.
 *
 * @param root - Repository root
 */
export function readGoogleOAuthCredentials(
  root: string,
): GoogleOAuthCredentials | null {
  const webEnv = readEnvFile(root, WEB_ENV);
  const clientId = (
    webEnv[GOOGLE_OAUTH_CLIENT_ID] ??
    process.env[GOOGLE_OAUTH_CLIENT_ID] ??
    ""
  ).trim();
  const clientSecret = (
    webEnv[GOOGLE_OAUTH_CLIENT_SECRET] ??
    process.env[GOOGLE_OAUTH_CLIENT_SECRET] ??
    ""
  ).trim();

  if (
    !clientId ||
    isPlaceholderEnvValue(clientId) ||
    !clientSecret ||
    isPlaceholderEnvValue(clientSecret)
  ) {
    return null;
  }
  return { clientId, clientSecret };
}

/**
 * Production JavaScript origins shown during `clerk deploy` Google OAuth setup.
 *
 * @param apex - Apex domain (e.g. `example.com`)
 */
export function googleOAuthProductionJavaScriptOrigins(apex: string): string[] {
  const { webProduction, marketingProduction } =
    deriveProductionHostnames(apex);
  return [`https://${webProduction}`, `https://${marketingProduction}`];
}

/**
 * Clerk Production Google OAuth redirect URI (`accounts.{apex}`).
 *
 * @param apex - Apex domain
 */
export function clerkProductionGoogleOAuthRedirectUri(apex: string): string {
  const normalized = normalizeApexDomainInput(apex);
  return `https://accounts.${normalized}/v1/oauth_callback`;
}

/**
 * Linked checklist for Google OAuth during interactive `clerk deploy`.
 *
 * @param apex - Production apex domain
 */
export function clerkDeployGoogleOAuthManualSteps(apex: string): string[] {
  const origins = googleOAuthProductionJavaScriptOrigins(apex);
  const redirectUri = clerkProductionGoogleOAuthRedirectUri(apex);
  return [
    `Google Cloud Console (select your project in the top bar): ${GOOGLE_CLOUD_CONSOLE}`,
    `OAuth consent screen — before go-live set Publishing status to In production: ${GOOGLE_CLOUD_OAUTH_CONSENT}`,
    `Create OAuth client: ${GOOGLE_CLOUD_CREDENTIALS} → Create Credentials → OAuth client ID → Web application`,
    `Authorized JavaScript origins: ${origins.join(", ")}`,
    `Authorized redirect URI: ${redirectUri}`,
    `In the clerk deploy prompt → Google OAuth → "I already have my Client ID and Client Secret" → paste both`,
    `Or paste later in Clerk (Production): ${CLERK_SSO_CONNECTIONS} → Google → Use custom credentials`,
    `Clerk Google OAuth guide: ${CLERK_GOOGLE_OAUTH_DOCS}`,
  ];
}

/**
 * Manual Clerk Dashboard steps when CLI patch is unavailable or fails.
 *
 * @param stack - When set, prefixes with which Clerk instance to select
 */
export function clerkGoogleManualSteps(stack?: SetupStack): string[] {
  return [
    stack
      ? clerkDashboardInstanceStep(stack)
      : `Open Clerk SSO connections: ${CLERK_SSO_CONNECTIONS}`,
    `Google connection: ${CLERK_SSO_CONNECTIONS} → add or open **Google** → For all users`,
    "Enable for sign-up and sign-in → turn on **Use custom credentials**",
    `Paste Client ID and Client Secret from ${GOOGLE_CLOUD_CREDENTIALS} → Save`,
  ];
}

/**
 * Prints steps to create a Google OAuth client for Clerk + One Tap.
 *
 * @param options - Origins, redirect URI, instance label, and whether setup will patch Clerk after prompts
 */
export function printGoogleOAuthGcpChecklist(options: {
  origins: string[];
  redirectUri: string;
  instanceLabel: string;
  /** When true, setup prompts next and applies credentials via `clerk config patch`. */
  setupAppliesCredentials?: boolean;
  immediate?: boolean;
}): void {
  const originList = options.origins.map((origin) => origin).join(", ");
  const steps = [
    `Sign in at ${GOOGLE_CLOUD_CONSOLE} — create or select a project (top bar) if you do not have one yet`,
    `Configure OAuth consent screen: ${GOOGLE_CLOUD_OAUTH_CONSENT} — required on new projects (Credentials shows a yellow banner until this is done)`,
    options.instanceLabel === "Production"
      ? "Consent screen: set Publishing status to **In production** before go-live (Testing mode caps at 100 users)"
      : "Consent screen: User type **External** → app name + support email → Save (defaults are fine for development)",
    `Open ${GOOGLE_CLOUD_CREDENTIALS} → Create Credentials → OAuth client ID → Web application`,
    `Authorized JavaScript origins: ${originList}`,
    `Authorized redirect URI: ${options.redirectUri}`,
    "Create → copy Client ID and Client Secret",
  ];
  if (options.setupAppliesCredentials) {
    steps.push(
      "Paste Client ID and Client Secret at the prompts below — setup applies them to Clerk (no dashboard paste needed)",
    );
  }

  printManualAction(
    `Google OAuth client (${options.instanceLabel}) for One Tap`,
    steps,
    { immediate: options.immediate },
  );
}

async function patchGoogleViaClerkCli(
  clerk: CliToolState,
  root: string,
  patch: Record<string, unknown>,
  instance: "development" | "production",
): Promise<{ ok: boolean; message?: string }> {
  const result = await runClerkConfigPatch(clerk, root, patch, {
    instance: instance === "production" ? "prod" : undefined,
    yes: true,
  });
  if (result.ok) {
    return { ok: true };
  }
  const detail = (result.stderr || result.stdout).trim().slice(0, 240);
  return { ok: false, message: detail || "clerk config patch failed" };
}

/**
 * Ensures Clerk Google OAuth is enabled and configured for Google One Tap.
 *
 * @param root - Repository root
 * @param setup - Persisted setup config
 * @param options - Issuer, keys, CLI context, and interactivity
 */
export async function syncClerkGoogleOAuth(
  root: string,
  setup: SetupConfig,
  options: {
    issuerDomain: string | null;
    secretKey: string;
    interactive: boolean;
    clerkCli?: CliToolState;
    instance?: "development" | "production";
  },
): Promise<SyncClerkGoogleOAuthResult> {
  const unchanged: SyncClerkGoogleOAuthResult = {
    connectionEnabled: false,
    credentialsConfigured: false,
  };

  if (!isClerkSecretKey(options.secretKey)) {
    return unchanged;
  }

  const instance = options.instance ?? "development";
  const instanceLabel =
    instance === "production" ? "Production" : "Development";

  if (!options.issuerDomain) {
    console.log(`\nClerk Google OAuth (${instanceLabel})`);
    console.log("○ Skipped — Clerk issuer domain unknown");
    printManualAction(
      "Configure Google in Clerk",
      clerkGoogleManualSteps("development"),
    );
    return unchanged;
  }

  const origins = googleOAuthJavaScriptOrigins(setup);
  const redirectUri = clerkGoogleOAuthRedirectUri(options.issuerDomain);

  console.log(`\nClerk Google OAuth + One Tap (${instanceLabel})`);

  let connectionEnabled = false;
  if (options.clerkCli) {
    const enable = await patchGoogleViaClerkCli(
      options.clerkCli,
      root,
      buildGoogleOAuthEnablePatch(),
      instance,
    );
    if (enable.ok) {
      connectionEnabled = true;
      console.log("✓ Enabled Google SSO connection via Clerk CLI");
    } else {
      console.log(
        `○ Could not enable Google via Clerk CLI${enable.message ? `: ${enable.message}` : ""}`,
      );
      printManualAction("Enable Google in Clerk Dashboard", [
        clerkDashboardInstanceStep(instance),
        ...clerkGoogleManualSteps().slice(1),
      ]);
    }
  } else {
    printManualAction("Enable Google in Clerk Dashboard", [
      clerkDashboardInstanceStep(instance),
      ...clerkGoogleManualSteps().slice(1),
    ]);
  }

  let credentials = readGoogleOAuthCredentials(root);

  if (!credentials && options.interactive) {
    printGoogleOAuthGcpChecklist({
      origins,
      redirectUri,
      instanceLabel,
      setupAppliesCredentials: Boolean(options.clerkCli),
      immediate: true,
    });

    const existing = readEnvFile(root, WEB_ENV);
    const existingId = isPlaceholderEnvValue(existing[GOOGLE_OAUTH_CLIENT_ID])
      ? undefined
      : existing[GOOGLE_OAUTH_CLIENT_ID];
    const existingSecret = isPlaceholderEnvValue(
      existing[GOOGLE_OAUTH_CLIENT_SECRET],
    )
      ? undefined
      : existing[GOOGLE_OAUTH_CLIENT_SECRET];

    const rawId = await promptSecret(`${GOOGLE_OAUTH_CLIENT_ID}`, {
      defaultValue: existingId,
      displayDefault: existingId ? maskSecret(existingId) : undefined,
      hint: "Paste Client ID from Google Cloud (Enter to skip One Tap for now)",
    });
    const clientId = normalizeEnvPaste(GOOGLE_OAUTH_CLIENT_ID, rawId).trim();

    if (clientId) {
      const rawSecret = await promptSecret(`${GOOGLE_OAUTH_CLIENT_SECRET}`, {
        defaultValue: existingSecret,
        displayDefault: existingSecret ? maskSecret(existingSecret) : undefined,
        hint: "Google Cloud Console → OAuth client → Client secret",
      });
      const clientSecret = normalizeEnvPaste(
        GOOGLE_OAUTH_CLIENT_SECRET,
        rawSecret,
      ).trim();
      if (clientSecret) {
        credentials = { clientId, clientSecret };
      }
    }
  }

  if (!credentials) {
    if (!options.interactive) {
      printGoogleOAuthGcpChecklist({
        origins,
        redirectUri,
        instanceLabel,
        setupAppliesCredentials: Boolean(options.clerkCli),
      });
    }
    console.log(
      "○ Skipped Google credentials — One Tap needs a GCP OAuth client; re-run setup after adding GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to apps/web/.env.local",
    );
    return { connectionEnabled, credentialsConfigured: false };
  }

  upsertEnvKeys(root, WEB_ENV, {
    [GOOGLE_OAUTH_CLIENT_ID]: credentials.clientId,
    [GOOGLE_OAUTH_CLIENT_SECRET]: credentials.clientSecret,
  });
  console.log(`✓ Saved ${GOOGLE_OAUTH_CLIENT_ID} → ${WEB_ENV}`);

  if (options.clerkCli) {
    const patched = await patchGoogleViaClerkCli(
      options.clerkCli,
      root,
      buildGoogleOAuthConfigPatch(credentials),
      instance,
    );
    if (patched.ok) {
      console.log("✓ Google custom credentials applied via Clerk CLI");
      return { connectionEnabled: true, credentialsConfigured: true };
    }
    console.log(
      `○ Could not apply Google credentials via Clerk CLI${patched.message ? `: ${patched.message}` : ""}`,
    );
  }

  printManualAction("Paste Google credentials in Clerk Dashboard", [
    ...clerkGoogleManualSteps(instance),
    `Clerk Google OAuth guide: ${CLERK_GOOGLE_OAUTH_DOCS}`,
    "Verify Google One Tap on /tasks in the web app",
  ]);

  return {
    connectionEnabled: connectionEnabled || Boolean(options.clerkCli),
    credentialsConfigured: false,
  };
}
