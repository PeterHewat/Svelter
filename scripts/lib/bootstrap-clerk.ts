/* eslint-disable no-console -- CLI wizard */
import { defaultE2eEmail } from "../../packages/config/e2e-auth";
import { isPlaceholderEnvValue } from "../../packages/config/env-placeholders";
import { clerkDevelopmentOrigins } from "../../packages/config/hostnames";
import { webDevOrigin } from "../../packages/config/dev-ports";
import { pagesProjectNames } from "./hosting-project-spec";
import { productNameToSlug } from "./repo-identity";
import {
  bootstrapClerkEnvViaCli,
  clerkAppMatchesProductName,
  createAndLinkClerkApp,
  clerkAppsCreateArgs,
  findClerkAppByName,
  findClerkAppByPublishableKey,
  linkClerkApp,
  listClerkApps,
  pullClerkEnv,
} from "./clerk-cli";
import {
  ensureClerkE2eUser,
  isClerkEmailPasswordDisabledMessage,
} from "./clerk-e2e-user";
import { ensureClerkConvexJwtTemplate } from "./clerk-jwt-template";
import {
  isClerkPublishableKey,
  isClerkSecretKey,
  issuerFromPublishableKey,
  mergeClerkAllowedOrigins,
  normalizeClerkIssuerDomain,
  resolveClerkIssuerDomain,
} from "./clerk-instance";
import {
  PUBLIC_CLERK_PUBLISHABLE_KEY,
  readClerkPublishableKey,
} from "./clerk-web-env";
import { readEnvFile, upsertEnvKeys } from "./env-file";
import { normalizeEnvPaste } from "./env-paste";
import { printManualAction } from "./manual-action";
import {
  CLERK_API_KEYS,
  CLERK_CREATE_APP,
  CLERK_DASHBOARD,
  CLERK_JWT_TEMPLATES,
} from "./platform-urls";
import { maskSecret, promptLine, promptSecret } from "./prompt";
import { canAutomateClerk, type SetupCliContext } from "./setup-cli";
import type { SetupConfig } from "./setup-config";
import { openUrlInBrowser } from "./open-url";

const WEB_ENV = "apps/web/.env.local";

/**
 * Ensures the Clerk JWT template exists and logs setup feedback.
 *
 * @param secretKey - Clerk development secret key
 */
async function reportClerkJwtTemplate(secretKey: string): Promise<void> {
  const jwtTemplate = await ensureClerkConvexJwtTemplate(secretKey);
  if (jwtTemplate.ok && jwtTemplate.created) {
    console.log('✓ Created Clerk JWT template "convex" (Convex + Clerk auth)');
  } else if (jwtTemplate.ok) {
    console.log('✓ Clerk JWT template "convex" present');
  } else {
    console.log(
      `○ Could not create Clerk JWT template "convex": ${jwtTemplate.message}`,
    );
    printManualAction('Create Clerk JWT template "convex"', [
      `JWT templates: ${CLERK_JWT_TEMPLATES}`,
      "New template → **Convex** preset → Save (name must be `convex`)",
      "Then resume `bun run setup` or re-run Playwright E2E",
    ]);
  }
}

/**
 * Opens a Clerk dashboard URL when possible.
 *
 * @param url - Clerk dashboard page
 */
async function openClerkDashboard(url: string): Promise<void> {
  const opened = await openUrlInBrowser(url);
  if (opened) {
    console.log("✓ Opened browser");
    return;
  }
  console.log(`  Open manually: ${url}`);
}

/**
 * Provisions the Playwright E2E Clerk user and writes email to web env.
 *
 * @param root - Repository root
 * @param setup - Persisted setup config
 * @param secretKey - Clerk development secret key
 * @param webEnv - Current web env file contents
 */
async function provisionE2eClerkUser(
  root: string,
  setup: SetupConfig,
  secretKey: string,
  webEnv: Record<string, string>,
): Promise<void> {
  if (!secretKey.startsWith("sk_test_")) {
    return;
  }

  const defaultEmail = defaultE2eEmail(setup.apexDomain);
  const existingEmail = isPlaceholderEnvValue(webEnv.E2E_USER_EMAIL)
    ? undefined
    : webEnv.E2E_USER_EMAIL;

  console.log("\nClerk E2E test user");

  let email = (existingEmail ?? defaultEmail).trim();
  let result = await ensureClerkE2eUser(secretKey, email);

  if (result.status === "failed") {
    console.log(`○ Could not create E2E user ${email}: ${result.message}`);
    email = (
      await promptLine("E2E_USER_EMAIL", {
        defaultValue: email,
        required: true,
      })
    ).trim();
    result = await ensureClerkE2eUser(secretKey, email);
  }

  if (result.status === "exists") {
    console.log(`✓ E2E user ${email} already exists in Clerk`);
  } else if (result.status === "created") {
    console.log(`✓ Created E2E user ${email} in Clerk`);
    console.log(
      "  Playwright signs in via @clerk/testing — password is not stored in apps/web/.env.local",
    );
  } else {
    console.log(`○ Could not create E2E user: ${result.message}`);
    if (isClerkEmailPasswordDisabledMessage(result.message)) {
      printManualAction("Enable Clerk Email + Password (Development)", [
        `Clerk dashboard: ${CLERK_DASHBOARD}`,
        "Configure → User & authentication → enable **Email** and **Password**",
        "Then resume `bun run setup`",
      ]);
    } else {
      printManualAction("Fix Clerk E2E user setup", [
        `Clerk dashboard: ${CLERK_DASHBOARD}`,
        "Create the user manually, or use a different E2E_USER_EMAIL",
        "Then resume `bun run setup`",
      ]);
    }
  }

  upsertEnvKeys(root, WEB_ENV, { E2E_USER_EMAIL: email });
  console.log(`✓ Set E2E_USER_EMAIL → ${email}`);
}

/**
 * Applies Clerk keys already present in `apps/web/.env.local` (no prompts).
 *
 * @param root - Repository root
 * @param setup - Persisted setup config
 * @param publishableKey - Clerk publishable key
 * @param secretKey - Clerk secret key
 */
async function applyClerkKeysFromEnv(
  root: string,
  setup: SetupConfig,
  publishableKey: string,
  secretKey: string,
): Promise<string | null> {
  console.log("\nClerk");
  console.log(
    `✓ Using keys from ${WEB_ENV} (pk ${maskSecret(publishableKey)})`,
  );

  let issuerDomain = await resolveClerkIssuerDomain(publishableKey, secretKey);
  if (issuerDomain) {
    console.log(`✓ Clerk issuer: ${issuerDomain}`);
  } else {
    const fromPk = issuerFromPublishableKey(publishableKey);
    if (fromPk) {
      issuerDomain = fromPk;
      console.log(`✓ Clerk issuer: ${issuerDomain}`);
    }
  }

  const webEnv = readEnvFile(root, WEB_ENV);
  await provisionE2eClerkUser(root, setup, secretKey, webEnv);

  if (secretKey.startsWith("sk_test_")) {
    await syncClerkDevOrigins(secretKey, setup);
    await reportClerkJwtTemplate(secretKey);
  }

  return issuerDomain;
}

/**
 * Returns Clerk keys from env when both are set and valid.
 *
 * @param root - Repository root
 */
function readValidClerkKeysFromEnv(root: string): {
  publishableKey: string;
  secretKey: string;
} | null {
  const webEnv = readEnvFile(root, WEB_ENV);
  const publishableKey = readClerkPublishableKey(webEnv);
  const secretKey = webEnv.CLERK_SECRET_KEY;
  if (
    !publishableKey ||
    isPlaceholderEnvValue(publishableKey) ||
    isPlaceholderEnvValue(secretKey) ||
    !isClerkPublishableKey(publishableKey) ||
    !isClerkSecretKey(secretKey!)
  ) {
    return null;
  }
  return { publishableKey, secretKey: secretKey! };
}

/**
 * Interactive Clerk key collection and env file updates (prefilled from `.env.local`).
 *
 * @param root - Repository root
 * @param setup - Persisted setup config
 */
async function promptClerkKeys(
  root: string,
  setup: SetupConfig,
): Promise<string | null> {
  const webEnv = readEnvFile(root, WEB_ENV);
  const existingPk = readClerkPublishableKey(webEnv);
  const existingSk = isPlaceholderEnvValue(webEnv.CLERK_SECRET_KEY)
    ? undefined
    : webEnv.CLERK_SECRET_KEY;

  console.log("\nClerk");
  printManualAction(
    "Clerk development keys",
    [
      `Create an application if needed: ${CLERK_CREATE_APP}`,
      `Open ${CLERK_API_KEYS} — stay on **Development**`,
      "Copy Publishable key (`pk_test_…`) and Secret key (`sk_test_…`)",
    ],
    { immediate: true },
  );
  await openClerkDashboard(CLERK_API_KEYS);

  let publishableKey = "";
  while (!isClerkPublishableKey(publishableKey)) {
    const rawPk = await promptSecret(
      `${PUBLIC_CLERK_PUBLISHABLE_KEY} (pk_test_…)`,
      {
        defaultValue: existingPk,
        displayDefault: existingPk ? maskSecret(existingPk) : undefined,
        required: !existingPk,
        hint: existingPk
          ? "Press Enter to keep the saved key, or paste a new Development publishable key"
          : "Paste the Development publishable key (input hidden), then press Enter",
      },
    );
    publishableKey = normalizeEnvPaste(PUBLIC_CLERK_PUBLISHABLE_KEY, rawPk);
    if (!isClerkPublishableKey(publishableKey)) {
      console.log(
        "  Expected a Clerk publishable key (pk_test_… or pk_live_…).",
      );
      publishableKey = "";
    }
  }

  const rawSk = await promptSecret("CLERK_SECRET_KEY (sk_test_…)", {
    defaultValue: existingSk,
    displayDefault: existingSk ? maskSecret(existingSk) : undefined,
    hint: "Same page → **Secret keys** — required for E2E and allowed-origin sync",
  });
  const secretKey = normalizeEnvPaste("CLERK_SECRET_KEY", rawSk);
  const resolvedSecret = isClerkSecretKey(secretKey) ? secretKey : "";

  let issuerDomain = await resolveClerkIssuerDomain(
    publishableKey,
    resolvedSecret || undefined,
  );
  if (issuerDomain) {
    console.log(`✓ Clerk issuer: ${issuerDomain}`);
  } else {
    const issuerDefault = issuerFromPublishableKey(publishableKey);
    let rawIssuer = "";
    while (!rawIssuer) {
      rawIssuer = await promptLine(
        "Clerk Frontend API URL (API keys page, e.g. https://….clerk.accounts.dev)",
        {
          defaultValue: issuerDefault ?? undefined,
          required: !issuerDefault,
        },
      );
    }
    issuerDomain = normalizeClerkIssuerDomain(rawIssuer);
  }

  const toWrite: Record<string, string> = {
    [PUBLIC_CLERK_PUBLISHABLE_KEY]: publishableKey,
  };
  if (resolvedSecret) {
    toWrite.CLERK_SECRET_KEY = resolvedSecret;
  }
  upsertEnvKeys(root, WEB_ENV, toWrite);
  console.log(`✓ Updated ${WEB_ENV} (pk ${maskSecret(publishableKey)})`);

  if (resolvedSecret) {
    await provisionE2eClerkUser(root, setup, resolvedSecret, {
      ...webEnv,
      ...toWrite,
    });
  }

  if (resolvedSecret.startsWith("sk_test_")) {
    await syncClerkDevOrigins(resolvedSecret, setup);
    await reportClerkJwtTemplate(resolvedSecret);
  } else {
    printManualAction("Add CLERK_SECRET_KEY for automation", [
      "Paste sk_test_… when prompted on a future setup run",
      "Setup will PATCH allowed origins and create the convex JWT template automatically",
    ]);
  }

  return issuerDomain;
}

/**
 * Ensures Development-instance allowed origins include localhost and staging web.
 *
 * @param secretKey - Clerk development secret key
 * @param setup - Persisted setup config
 */
async function syncClerkDevOrigins(
  secretKey: string,
  setup: SetupConfig,
): Promise<void> {
  const { web } = pagesProjectNames(productNameToSlug(setup.productName));
  const clerkDevOrigins = clerkDevelopmentOrigins(web);
  console.log("\nClerk allowed origins (Development instance)");

  const result = await mergeClerkAllowedOrigins(secretKey, clerkDevOrigins, {
    developmentOrigin: webDevOrigin,
  });

  if (result.ok) {
    if (result.added.length > 0) {
      console.log(
        `✓ Clerk allowed origins updated (+ ${result.added.join(", ")})`,
      );
    } else {
      console.log(
        `✓ Clerk allowed origins already include ${clerkDevOrigins.join(", ")}`,
      );
    }
    return;
  }

  console.log(
    `○ Could not update Clerk allowed origins via API: ${result.message}`,
  );
  printManualAction("Set Clerk allowed origins via Backend API", [
    "Allowed origins are not configured on the Clerk Domains dashboard page",
    `PATCH https://api.clerk.com/v1/instance with Authorization: Bearer <CLERK_SECRET_KEY>`,
    `Body: {"allowed_origins":${JSON.stringify(clerkDevOrigins)},"development_origin":"${webDevOrigin}"}`,
    "Re-run setup after fixing the secret key, or apply the PATCH manually",
  ]);
}

/**
 * When env keys belong to a different Clerk app than the product name, offers to create the named app.
 *
 * @param root - Repository root
 * @param setup - Persisted setup config
 * @param clerk - Clerk CLI state
 * @param envKeys - Valid Clerk keys from `apps/web/.env.local`
 * @param keyedApp - Clerk app matched by the publishable key
 * @returns Resolved issuer domain
 */
async function adoptOrCreateProductClerkApp(
  root: string,
  setup: SetupConfig,
  clerk: SetupCliContext["clerk"],
  envKeys: { publishableKey: string; secretKey: string },
  keyedApp: { id: string; name: string },
): Promise<string | null> {
  console.log("\nClerk");
  const issuer = issuerFromPublishableKey(envKeys.publishableKey);
  console.log(
    `○ ${WEB_ENV} keys are for "${keyedApp.name}"${issuer ? ` (${issuer})` : ""}, not "${setup.productName}"`,
  );
  console.log(`→ Creating Clerk application "${setup.productName}"…`);

  const appId = await createAndLinkClerkApp(clerk, root, setup.productName);
  if (appId && (await pullClerkEnv(clerk, root))) {
    const afterPull = readValidClerkKeysFromEnv(root);
    if (afterPull) {
      return applyClerkKeysFromEnv(
        root,
        setup,
        afterPull.publishableKey,
        afterPull.secretKey,
      );
    }
  }

  printManualAction("Create Clerk application via CLI", [
    `Run: ${[...clerk.command, ...clerkAppsCreateArgs(setup.productName, true)].join(" ")}`,
    `Then: ${[...clerk.command, "link", "--app", "app_…"].join(" ")}`,
    `Pull keys: ${[...clerk.command, "env", "pull", "--file", ".env.local"].join(" ")} (from apps/web)`,
    "Re-run `bun run setup`",
  ]);
  return null;
}

/**
 * Guides Clerk setup via CLI or dashboard fallback.
 *
 * @param root - Repository root
 * @param setup - Persisted setup config
 * @param interactive - When true, prompt for Clerk keys (prefilled from env)
 * @param cliContext - CLI readiness from the prerequisites step
 * @returns Resolved Clerk JWT issuer domain, if known
 */
export async function bootstrapClerk(
  root: string,
  setup: SetupConfig,
  interactive: boolean,
  cliContext?: SetupCliContext,
): Promise<string | null> {
  const webEnv = readEnvFile(root, WEB_ENV);
  const existingIssuerConfigured =
    readClerkPublishableKey(webEnv) &&
    !isPlaceholderEnvValue(readClerkPublishableKey(webEnv)!);

  let issuerDomain: string | null = null;

  const envKeys = readValidClerkKeysFromEnv(root);
  const clerkCliReady =
    interactive && cliContext && canAutomateClerk(cliContext);

  if (clerkCliReady) {
    const namedApp = await findClerkAppByName(
      cliContext.clerk,
      root,
      setup.productName,
    );
    const keyedApp = envKeys
      ? await findClerkAppByPublishableKey(
          cliContext.clerk,
          root,
          envKeys.publishableKey,
        )
      : undefined;
    const resolvedApp = namedApp ?? keyedApp;
    const envKeysMismatch = Boolean(
      envKeys && namedApp && keyedApp && namedApp.id !== keyedApp.id,
    );

    if (envKeys && envKeysMismatch && namedApp) {
      const envIssuer = issuerFromPublishableKey(envKeys.publishableKey);
      console.log("\nClerk");
      console.log(
        `○ ${WEB_ENV} keys are for another Clerk app${envIssuer ? ` (${envIssuer})` : ""} — using "${namedApp.name}" (${namedApp.id})`,
      );
      await linkClerkApp(cliContext.clerk, root, namedApp.id);
      if (await pullClerkEnv(cliContext.clerk, root)) {
        const afterPull = readValidClerkKeysFromEnv(root);
        if (afterPull) {
          issuerDomain = await applyClerkKeysFromEnv(
            root,
            setup,
            afterPull.publishableKey,
            afterPull.secretKey,
          );
        }
      }
      if (!issuerDomain) {
        issuerDomain = await promptClerkKeys(root, setup);
      }
    } else if (
      envKeys &&
      keyedApp &&
      !namedApp &&
      !clerkAppMatchesProductName(keyedApp, setup.productName)
    ) {
      issuerDomain = await adoptOrCreateProductClerkApp(
        root,
        setup,
        cliContext.clerk,
        envKeys,
        keyedApp,
      );
    } else if (envKeys) {
      if (resolvedApp) {
        console.log("\nClerk");
        if (keyedApp && !namedApp) {
          const issuer = issuerFromPublishableKey(envKeys.publishableKey);
          console.log(
            `✓ Matched Clerk app "${resolvedApp.name}" (${resolvedApp.id}) from ${WEB_ENV}${issuer ? ` (${issuer})` : ""}`,
          );
        } else {
          console.log(
            `✓ Found Clerk app "${resolvedApp.name}" (${resolvedApp.id})`,
          );
        }
        await linkClerkApp(cliContext.clerk, root, resolvedApp.id);
      } else {
        const issuer = issuerFromPublishableKey(envKeys.publishableKey);
        console.log("\nClerk");
        console.log(
          `○ Using keys from ${WEB_ENV}${issuer ? ` (${issuer})` : ""} — no matching app in \`clerk apps list\``,
        );
        const listed = await listClerkApps(cliContext.clerk, root);
        if (listed.length > 0) {
          console.log("  Apps visible to `bunx clerk whoami`:");
          for (const app of listed) {
            console.log(`    • ${app.name} (${app.id})`);
          }
        }
        console.log(
          `  Link manually: ${[...cliContext.clerk.command, "link", "--app", "app_…"].join(" ")}`,
        );
      }
      issuerDomain = await applyClerkKeysFromEnv(
        root,
        setup,
        envKeys.publishableKey,
        envKeys.secretKey,
      );
    } else if (resolvedApp) {
      console.log("\nClerk");
      console.log(
        `✓ Found Clerk app "${resolvedApp.name}" (${resolvedApp.id})`,
      );
      await linkClerkApp(cliContext.clerk, root, resolvedApp.id);
      if (await pullClerkEnv(cliContext.clerk, root)) {
        const afterPull = readValidClerkKeysFromEnv(root);
        if (afterPull) {
          issuerDomain = await applyClerkKeysFromEnv(
            root,
            setup,
            afterPull.publishableKey,
            afterPull.secretKey,
          );
        }
      }
      if (!issuerDomain) {
        issuerDomain = await promptClerkKeys(root, setup);
      }
    } else {
      const pulled = await bootstrapClerkEnvViaCli(
        root,
        setup,
        cliContext.clerk,
      );
      const afterPull = pulled ? readValidClerkKeysFromEnv(root) : null;
      if (afterPull) {
        issuerDomain = await applyClerkKeysFromEnv(
          root,
          setup,
          afterPull.publishableKey,
          afterPull.secretKey,
        );
      } else {
        issuerDomain = await promptClerkKeys(root, setup);
      }
    }
  } else if (envKeys) {
    issuerDomain = await applyClerkKeysFromEnv(
      root,
      setup,
      envKeys.publishableKey,
      envKeys.secretKey,
    );
  } else if (interactive) {
    issuerDomain = await promptClerkKeys(root, setup);
  } else if (existingIssuerConfigured) {
    const pk = readClerkPublishableKey(webEnv)!;
    issuerDomain = await resolveClerkIssuerDomain(
      pk,
      isPlaceholderEnvValue(webEnv.CLERK_SECRET_KEY)
        ? undefined
        : webEnv.CLERK_SECRET_KEY,
    );
  }

  return issuerDomain;
}
