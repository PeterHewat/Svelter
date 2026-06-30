/* eslint-disable no-console -- CLI */
import {
  clerkDevelopmentOrigins,
  deriveProductionHostnames,
  pagesProductionHostname,
} from "../../packages/config/hostnames";
import {
  normalizeApexDomainInput,
  hasApexDomain,
} from "../../packages/config/validate-domain";
import { isPlaceholderEnvValue } from "../../packages/config/env-placeholders";
import { runClerkConfigPatch } from "./clerk-cli";
import { isClerkSecretKey, normalizeClerkIssuerDomain } from "./clerk-instance";
import { readEnvFile, upsertEnvKeys } from "./env-file";
import { pagesProjectNames } from "./hosting-project-spec";
import { printManualAction, requireManualAction } from "./manual-action";
import {
  CLERK_GOOGLE_OAUTH_DOCS,
  CLERK_SSO_CONNECTIONS,
  GOOGLE_CLOUD_CONSOLE,
  GOOGLE_CLOUD_CREDENTIALS,
  GOOGLE_CLOUD_OAUTH_CONSENT,
} from "./platform-urls";
import { productNameToSlug } from "./repo-identity";
import { maskSecret, promptConfirm, promptSecret } from "./prompt";
import { normalizeEnvPaste } from "./env-paste";
import type { CliToolState } from "./setup-cli";
import type { SetupConfig } from "./setup-config";
import {
  clerkDashboardInstanceStep,
  type SetupStack,
} from "./setup-stack-labels";

const WEB_ENV = "apps/web/.env.local";

/** Development Clerk + One Tap — patched to the Clerk Development instance. */
export const GOOGLE_OAUTH_DEVELOPMENT_CLIENT_ID =
  "GOOGLE_OAUTH_DEVELOPMENT_CLIENT_ID";
export const GOOGLE_OAUTH_DEVELOPMENT_CLIENT_SECRET =
  "GOOGLE_OAUTH_DEVELOPMENT_CLIENT_SECRET";
/** Production Clerk — separate GCP OAuth client (required when an apex domain is configured). */
export const GOOGLE_OAUTH_PRODUCTION_CLIENT_ID =
  "GOOGLE_OAUTH_PRODUCTION_CLIENT_ID";
export const GOOGLE_OAUTH_PRODUCTION_CLIENT_SECRET =
  "GOOGLE_OAUTH_PRODUCTION_CLIENT_SECRET";

export type GoogleOAuthCredentials = {
  clientId: string;
  clientSecret: string;
};

export type GoogleOAuthCredentialsSource = "development" | "production";

export type SyncClerkGoogleOAuthResult = {
  connectionEnabled: boolean;
  credentialsConfigured: boolean;
};

/** Google OAuth web client ID shape (`{numeric}-{id}.apps.googleusercontent.com`). */
const GOOGLE_OAUTH_CLIENT_ID_PATTERN =
  /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/i;

/** Google OAuth client secret shape (current GCP console format). */
const GOOGLE_OAUTH_CLIENT_SECRET_PATTERN = /^GOCSPX-[A-Za-z0-9_-]+$/;

/**
 * Returns null when credentials are valid; otherwise an error message.
 *
 * @param credentials - Google OAuth client credentials
 */
export function validateGoogleOAuthCredentials(
  credentials: GoogleOAuthCredentials,
): string | null {
  return (
    validateGoogleOAuthClientId(credentials.clientId) ??
    validateGoogleOAuthClientSecret(credentials.clientSecret) ??
    validateGoogleOAuthCredentialPair(
      credentials.clientId,
      credentials.clientSecret,
    )
  );
}

/**
 * Validates a Google OAuth Client ID pasted during setup.
 *
 * @param value - Raw Client ID
 */
export function validateGoogleOAuthClientId(value: string): string | null {
  const normalized = value.trim();
  if (!GOOGLE_OAUTH_CLIENT_ID_PATTERN.test(normalized)) {
    return "Expected a Google OAuth Client ID like 123456789-abc….apps.googleusercontent.com";
  }
  return null;
}

/**
 * Validates a Google OAuth Client secret pasted during setup.
 *
 * @param value - Raw Client secret
 */
export function validateGoogleOAuthClientSecret(value: string): string | null {
  const normalized = value.trim();
  if (/\.apps\.googleusercontent\.com$/i.test(normalized)) {
    return "That looks like a Client ID — paste the Client secret from the same OAuth client";
  }
  if (!GOOGLE_OAUTH_CLIENT_SECRET_PATTERN.test(normalized)) {
    return "Expected Client secret starting with GOCSPX- (copy from Google Cloud, not the Client ID)";
  }
  return null;
}

/**
 * Returns whether Client ID and secret are distinct, non-swapped GCP values.
 *
 * @param clientId - OAuth client ID
 * @param clientSecret - OAuth client secret
 */
export function validateGoogleOAuthCredentialPair(
  clientId: string,
  clientSecret: string,
): string | null {
  if (clientId.trim() === clientSecret.trim()) {
    return "Client ID and Client secret must be different values";
  }
  return null;
}

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
 * JavaScript origins for the **Development** GCP OAuth client (localhost + staging).
 *
 * @param setup - Persisted setup config
 */
export function googleOAuthDevelopmentJavaScriptOrigins(
  setup: SetupConfig,
): string[] {
  const { web } = pagesProjectNames(productNameToSlug(setup.productName));
  const origins = [...clerkDevelopmentOrigins(web)];
  if (!origins.includes("http://localhost")) {
    origins.unshift("http://localhost");
  }
  const prodPages = `https://${pagesProductionHostname(web)}`;
  if (!origins.includes(prodPages)) {
    origins.push(prodPages);
  }
  return origins;
}

/**
 * When true, setup requires distinct Development and Production GCP OAuth clients.
 *
 * @param setup - Persisted setup config
 */
export function requiresSeparateGoogleOAuthClients(
  setup: SetupConfig,
): boolean {
  return hasApexDomain(setup.apexDomain);
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
 * Env keys used for Google OAuth credentials for a Clerk instance.
 *
 * @param instance - Clerk Development or Production
 */
export function googleOAuthCredentialEnvKeys(
  instance: "development" | "production",
): { clientIdKey: string; clientSecretKey: string } {
  if (instance === "production") {
    return {
      clientIdKey: GOOGLE_OAUTH_PRODUCTION_CLIENT_ID,
      clientSecretKey: GOOGLE_OAUTH_PRODUCTION_CLIENT_SECRET,
    };
  }
  return {
    clientIdKey: GOOGLE_OAUTH_DEVELOPMENT_CLIENT_ID,
    clientSecretKey: GOOGLE_OAUTH_DEVELOPMENT_CLIENT_SECRET,
  };
}

function readEnvCredential(
  webEnv: Record<string, string>,
  key: string,
): string {
  const value = (webEnv[key] ?? process.env[key] ?? "").trim();
  if (!value || isPlaceholderEnvValue(value)) {
    return "";
  }
  return value;
}

/**
 * Reads Google OAuth credentials from web env for a Clerk instance.
 *
 * Development uses `GOOGLE_OAUTH_DEVELOPMENT_*`; Production uses `GOOGLE_OAUTH_PRODUCTION_*`.
 *
 * @param root - Repository root
 * @param instance - Clerk Development or Production
 */
export function readGoogleOAuthCredentials(
  root: string,
  instance: "development" | "production" = "development",
): {
  credentials: GoogleOAuthCredentials;
  source: GoogleOAuthCredentialsSource;
} | null {
  const webEnv = readEnvFile(root, WEB_ENV);
  const { clientIdKey, clientSecretKey } =
    googleOAuthCredentialEnvKeys(instance);

  const clientId = readEnvCredential(webEnv, clientIdKey);
  const clientSecret = readEnvCredential(webEnv, clientSecretKey);

  if (!clientId || !clientSecret) {
    return null;
  }
  const credentials = { clientId, clientSecret };
  if (validateGoogleOAuthCredentials(credentials)) {
    return null;
  }
  return {
    credentials,
    source: instance === "production" ? "production" : "development",
  };
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
export function clerkDeployGoogleOAuthManualSteps(
  apex: string,
  productName?: string,
): string[] {
  const origins = googleOAuthProductionJavaScriptOrigins(apex);
  const redirectUri = clerkProductionGoogleOAuthRedirectUri(apex);
  const label = productName?.trim() || "My App";
  return [
    `Open Google Cloud Console → select your project (top bar): ${GOOGLE_CLOUD_CONSOLE}`,
    `Set OAuth consent screen Publishing status to **In production**: ${GOOGLE_CLOUD_OAUTH_CONSENT}`,
    `Create a **${label} (Production)** OAuth client — separate from Development (required when an apex domain is configured)`,
    `Open ${GOOGLE_CLOUD_CREDENTIALS} → **Create Credentials** → **OAuth client ID**`,
    `Application type: **Web application**`,
    `Set Authorized JavaScript origins: ${origins.join(", ")}`,
    `Set Authorized redirect URI: ${redirectUri}`,
    `Paste at the \`clerk deploy\` Google OAuth prompt, then save in setup as GOOGLE_OAUTH_PRODUCTION_CLIENT_ID / GOOGLE_OAUTH_PRODUCTION_CLIENT_SECRET`,
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
    "Configure → **User & authentication** → **Social connections** → open **Google**",
    "Enable for sign-up and sign-in → turn on **Use custom credentials**",
    `Set Client ID and Client Secret from ${GOOGLE_CLOUD_CREDENTIALS} → click **Save**`,
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
  /** Suggested OAuth client name in Google Cloud Console. */
  clientNameHint?: string;
  /** Env keys written when setup prompts for credentials. */
  credentialEnvKeys?: { clientIdKey: string; clientSecretKey: string };
  /** When true, setup prompts next and applies credentials via `clerk config patch`. */
  setupAppliesCredentials?: boolean;
  immediate?: boolean;
}): void {
  const originList = options.origins.map((origin) => origin).join(", ");
  const steps = [
    `Sign in at ${GOOGLE_CLOUD_CONSOLE} — create or select a project (top bar) if needed`,
    `Open ${GOOGLE_CLOUD_OAUTH_CONSENT} → configure OAuth consent screen (required on new projects)`,
    options.instanceLabel === "Production"
      ? "Set Publishing status to **In production** before go-live (Testing mode caps at 100 users)"
      : "Set User type to **External** → enter app name + support email → click **Save**",
    options.clientNameHint
      ? `Open ${GOOGLE_CLOUD_CREDENTIALS} → **Create Credentials** → **OAuth client ID**`
      : `Open ${GOOGLE_CLOUD_CREDENTIALS} → **Create Credentials** → **OAuth client ID**`,
    options.clientNameHint
      ? `Name it **${options.clientNameHint}** → Application type: **Web application**`
      : `Application type: **Web application**`,
    `Set Authorized JavaScript origins: ${originList}`,
    `Set Authorized redirect URI: ${options.redirectUri}`,
    "Click **Create** → copy **Client ID** and **Client secret**",
  ];
  if (options.setupAppliesCredentials && options.credentialEnvKeys) {
    steps.push(
      `Paste both values at the prompts below — saved as ${options.credentialEnvKeys.clientIdKey} / ${options.credentialEnvKeys.clientSecretKey}`,
    );
  } else if (options.setupAppliesCredentials) {
    steps.push(
      "Paste both values at the prompts below — setup applies them to Clerk",
    );
  }
  if (options.instanceLabel === "Development" && options.credentialEnvKeys) {
    steps.push(
      "A separate Production OAuth client is required later — setup prompts for GOOGLE_OAUTH_PRODUCTION_* during Production bootstrap when an apex domain is configured",
    );
  }
  if (options.instanceLabel === "Production") {
    steps.push(
      "Do not reuse the Development client — Production must use GOOGLE_OAUTH_PRODUCTION_* only",
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
    /** When true, missing Production credentials log a follow-up instead of exiting setup. */
    autoConfirm?: boolean;
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

  const origins =
    instance === "production" && setup.apexDomain?.trim()
      ? googleOAuthProductionJavaScriptOrigins(setup.apexDomain)
      : googleOAuthDevelopmentJavaScriptOrigins(setup);
  const redirectUri = clerkGoogleOAuthRedirectUri(options.issuerDomain);
  const envKeys = googleOAuthCredentialEnvKeys(instance);
  const productionCredentialsRequired =
    instance === "production" && requiresSeparateGoogleOAuthClients(setup);

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

  const resolved = readGoogleOAuthCredentials(root, instance);
  let credentials = resolved?.credentials ?? null;

  if (!credentials) {
    const webEnv = readEnvFile(root, WEB_ENV);
    const storedId = readEnvCredential(webEnv, envKeys.clientIdKey);
    const storedSecret = readEnvCredential(webEnv, envKeys.clientSecretKey);
    if (storedId || storedSecret) {
      console.log(
        `○ Invalid or incomplete ${envKeys.clientIdKey} / ${envKeys.clientSecretKey} in ${WEB_ENV} — re-enter below`,
      );
    }
  }

  if (!credentials && options.interactive) {
    const oneTapQuestion = productionCredentialsRequired
      ? "Set up Google One Tap for Production? (required with a custom apex domain)"
      : "Set up Google One Tap?";
    const setupOneTap = await promptConfirm(oneTapQuestion, {
      defaultYes: true,
    });

    if (!setupOneTap) {
      if (productionCredentialsRequired) {
        requireManualAction(
          "Add Production Google OAuth credentials",
          [
            `Create **${setup.productName} (Production)** in ${GOOGLE_CLOUD_CREDENTIALS}`,
            `Set origins: ${origins.join(", ")}`,
            `Set redirect URI: ${redirectUri}`,
            `Save as ${envKeys.clientIdKey} and ${envKeys.clientSecretKey} in ${WEB_ENV}`,
            "Re-run `bun run setup`",
          ],
          { autoConfirm: options.autoConfirm },
        );
      }
      console.log(
        `○ Skipped Google One Tap — add ${envKeys.clientIdKey} and ${envKeys.clientSecretKey} to ${WEB_ENV} to enable later`,
      );
      return { connectionEnabled, credentialsConfigured: false };
    }

    printGoogleOAuthGcpChecklist({
      origins,
      redirectUri,
      instanceLabel,
      clientNameHint:
        instance === "production"
          ? `${setup.productName} (Production)`
          : `${setup.productName} (Development)`,
      credentialEnvKeys: envKeys,
      setupAppliesCredentials: Boolean(options.clerkCli),
      immediate: true,
    });

    const existing = readEnvFile(root, WEB_ENV);
    const existingId =
      readEnvCredential(existing, envKeys.clientIdKey) || undefined;
    const existingSecret =
      readEnvCredential(existing, envKeys.clientSecretKey) || undefined;

    const rawId = await promptSecret(envKeys.clientIdKey, {
      defaultValue: existingId,
      displayDefault: existingId ? maskSecret(existingId) : undefined,
      label: envKeys.clientIdKey,
      required: true,
      hint: "Paste Client ID from the OAuth client you created above",
      validate: validateGoogleOAuthClientId,
    });
    const clientId = normalizeEnvPaste(envKeys.clientIdKey, rawId).trim();

    const rawSecret = await promptSecret(envKeys.clientSecretKey, {
      defaultValue: existingSecret,
      displayDefault: existingSecret ? maskSecret(existingSecret) : undefined,
      label: envKeys.clientSecretKey,
      hint: "Paste Client secret (GOCSPX-…) from the same OAuth client — not the Client ID",
      required: true,
      validate: (value) =>
        validateGoogleOAuthClientSecret(value) ??
        validateGoogleOAuthCredentialPair(clientId, value),
    });
    const clientSecret = normalizeEnvPaste(
      envKeys.clientSecretKey,
      rawSecret,
    ).trim();
    credentials = { clientId, clientSecret };
  }

  if (!credentials) {
    if (!options.interactive) {
      printGoogleOAuthGcpChecklist({
        origins,
        redirectUri,
        instanceLabel,
        clientNameHint:
          instance === "production"
            ? `${setup.productName} (Production)`
            : `${setup.productName} (Development)`,
        credentialEnvKeys: envKeys,
        setupAppliesCredentials: Boolean(options.clerkCli),
      });
    }
    const skipMessage = `○ Skipped Google One Tap — add ${envKeys.clientIdKey} and ${envKeys.clientSecretKey} to ${WEB_ENV}, then re-run setup`;
    if (productionCredentialsRequired) {
      requireManualAction(
        "Add Production Google OAuth credentials",
        [
          `Create **${setup.productName} (Production)** in ${GOOGLE_CLOUD_CREDENTIALS}`,
          `Set origins: ${origins.join(", ")}`,
          `Set redirect URI: ${redirectUri}`,
          `Save as ${envKeys.clientIdKey} and ${envKeys.clientSecretKey} in ${WEB_ENV}`,
          "Re-run `bun run setup`",
        ],
        { autoConfirm: options.autoConfirm },
      );
    }
    console.log(skipMessage);
    return { connectionEnabled, credentialsConfigured: false };
  }

  upsertEnvKeys(root, WEB_ENV, {
    [envKeys.clientIdKey]: credentials.clientId,
    [envKeys.clientSecretKey]: credentials.clientSecret,
  });
  console.log(`✓ Saved ${envKeys.clientIdKey} → ${WEB_ENV}`);

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
