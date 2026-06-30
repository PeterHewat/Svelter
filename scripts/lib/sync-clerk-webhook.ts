/* eslint-disable no-console -- CLI */
import { isPlaceholderEnvValue } from "../../packages/config/env-placeholders";
import { isClerkSecretKey } from "./clerk-instance";
import {
  CLERK_CONVEX_WEBHOOK_PATH,
  CLERK_USER_WEBHOOK_EVENTS,
  ensureClerkSvixApp,
} from "./clerk-convex-webhook";
import { readConvexUrlFromWebEnv } from "./clerk-web-env";
import { getConvexEnvVar, setConvexEnvVar } from "./convex-env";
import { isConvexLinked } from "./convex-link";
import { readConvexUrlFromRootEnv } from "./convex-url";
import { upsertEnvKeys, readEnvFile } from "./env-file";
import { printManualAction, exitWithManualAction } from "./manual-action";
import { openUrlInBrowser } from "./open-url";
import { CLERK_WEBHOOKS } from "./platform-urls";
import { maskSecret, promptSecret } from "./prompt";
import { normalizeEnvPaste } from "./env-paste";
import { convexSiteUrlFromCloudUrl } from "./sync-anon-auth";

const WEB_ENV = "apps/web/.env.local";

export type SyncClerkWebhookResult = {
  configured: boolean;
  changed: boolean;
};

/**
 * Validates a Clerk webhook signing secret pasted during setup.
 *
 * @param value - Raw signing secret
 */
export function validateClerkWebhookSigningSecret(
  value: string,
): string | null {
  const normalized = value.trim();
  if (normalized.startsWith("pk_") || normalized.startsWith("sk_")) {
    return "That looks like a Clerk API key — paste the webhook signing secret (whsec_…)";
  }
  if (/\.apps\.googleusercontent\.com$/i.test(normalized)) {
    return "That looks like a Google OAuth Client ID — paste the webhook signing secret (whsec_…)";
  }
  if (normalized.startsWith("GOCSPX-")) {
    return "That looks like a Google OAuth Client secret — paste the webhook signing secret (whsec_…)";
  }
  if (!/^whsec_[A-Za-z0-9+/=_-]+$/.test(normalized)) {
    return "Expected signing secret starting with whsec_ — copy from the endpoint you created";
  }
  return null;
}

/**
 * Whether to copy `CLERK_WEBHOOK_SIGNING_SECRET` from Convex into web env.
 * Used when a prior setup run uploaded the secret to Convex but local env was reset.
 *
 * @param webSecret - Value from `apps/web/.env.local`, if any
 * @param convexSecret - Value from the linked Convex deployment, if any
 */
export function shouldRestoreWebhookSecretFromConvex(
  webSecret: string | undefined,
  convexSecret: string | undefined,
): boolean {
  const convex = convexSecret?.trim();
  if (!convex || validateClerkWebhookSigningSecret(convex) !== null) {
    return false;
  }
  const web = webSecret?.trim();
  if (!web || isPlaceholderEnvValue(web)) {
    return true;
  }
  return validateClerkWebhookSigningSecret(web) !== null;
}

/**
 * Builds the Convex HTTP webhook URL from a `.convex.cloud` deployment URL.
 *
 * @param convexCloudUrl - Value of `PUBLIC_CONVEX_URL`
 */
export function clerkConvexWebhookUrl(convexCloudUrl: string): string {
  const origin = convexSiteUrlFromCloudUrl(convexCloudUrl);
  return `${origin}${CLERK_CONVEX_WEBHOOK_PATH}`;
}

/**
 * Manual Clerk Dashboard steps when the webhook signing secret is not in env yet.
 *
 * @param webhookUrl - Convex HTTP endpoint (`https://…convex.site/clerk-webhook`)
 * @param events - Comma-separated Clerk event names to subscribe to
 */
export function clerkWebhookManualSteps(
  webhookUrl: string,
  events: string,
): string[] {
  return [
    `Open ${CLERK_WEBHOOKS} — stay on **Development**`,
    "In Configure → Webhooks → Endpoints, click **Add Endpoint**",
    `Set Endpoint URL: ${webhookUrl}`,
    `Subscribe to events: ${events} → click **Create**`,
    "Open the endpoint → copy **Signing secret** (`whsec_…`)",
  ];
}

/**
 * Uploads `CLERK_WEBHOOK_SIGNING_SECRET` to Convex when it differs from the dev deployment.
 *
 * @param root - Repository root
 * @param signingSecret - Webhook signing secret (`whsec_…`)
 */
async function syncSigningSecretToConvex(
  root: string,
  signingSecret: string,
): Promise<SyncClerkWebhookResult> {
  const existingConvexSecret = await getConvexEnvVar(
    root,
    "CLERK_WEBHOOK_SIGNING_SECRET",
  );
  if (existingConvexSecret === signingSecret) {
    return { configured: true, changed: false };
  }

  const { ok } = await setConvexEnvVar(
    root,
    "CLERK_WEBHOOK_SIGNING_SECRET",
    signingSecret,
    false,
  );
  if (ok) {
    console.log("✓ Convex CLERK_WEBHOOK_SIGNING_SECRET set on dev deployment");
  }
  return { configured: ok, changed: ok };
}

/**
 * Ensures the Clerk Svix app exists, guides webhook endpoint setup, and syncs
 * `CLERK_WEBHOOK_SIGNING_SECRET` to Convex (from env or an interactive prompt).
 *
 * @param root - Repository root
 * @param interactive - When true, prompt for the signing secret after dashboard steps
 */
export async function syncClerkWebhookEnv(
  root: string,
  interactive = false,
): Promise<SyncClerkWebhookResult> {
  const unchanged: SyncClerkWebhookResult = {
    configured: false,
    changed: false,
  };

  if (!isConvexLinked(root)) {
    return unchanged;
  }

  const webEnv = readEnvFile(root, WEB_ENV);
  const secretKey = webEnv.CLERK_SECRET_KEY?.trim();
  if (
    !secretKey ||
    isPlaceholderEnvValue(secretKey) ||
    !isClerkSecretKey(secretKey)
  ) {
    return unchanged;
  }

  const convexUrl =
    readConvexUrlFromRootEnv(root) ?? readConvexUrlFromWebEnv(webEnv);
  if (!convexUrl || isPlaceholderEnvValue(convexUrl)) {
    return unchanged;
  }

  const webhookUrl = clerkConvexWebhookUrl(convexUrl);
  console.log("\nClerk webhook → Convex");

  const svixApp = await ensureClerkSvixApp(secretKey);
  if (svixApp.ok) {
    console.log(
      svixApp.alreadyExisted
        ? "✓ Clerk Svix app already present"
        : "✓ Clerk Svix app ready",
    );
  } else {
    console.log(`○ Could not prepare Clerk webhooks: ${svixApp.message}`);
  }

  const events = CLERK_USER_WEBHOOK_EVENTS.join(", ");
  const existingConvexSecret = await getConvexEnvVar(
    root,
    "CLERK_WEBHOOK_SIGNING_SECRET",
  );
  let webSigningSecret = isPlaceholderEnvValue(
    webEnv.CLERK_WEBHOOK_SIGNING_SECRET,
  )
    ? undefined
    : webEnv.CLERK_WEBHOOK_SIGNING_SECRET?.trim();

  if (webSigningSecret) {
    const webhookError = validateClerkWebhookSigningSecret(webSigningSecret);
    if (!webhookError) {
      return syncSigningSecretToConvex(root, webSigningSecret);
    }
    console.log(
      `○ Invalid CLERK_WEBHOOK_SIGNING_SECRET in ${WEB_ENV} — re-enter below`,
    );
  }

  if (existingConvexSecret?.trim()) {
    const convexSigningSecret = existingConvexSecret.trim();
    if (
      shouldRestoreWebhookSecretFromConvex(
        webSigningSecret,
        convexSigningSecret,
      )
    ) {
      upsertEnvKeys(root, WEB_ENV, {
        CLERK_WEBHOOK_SIGNING_SECRET: convexSigningSecret,
      });
      console.log(
        `✓ Restored CLERK_WEBHOOK_SIGNING_SECRET from Convex → ${WEB_ENV}`,
      );
      return { configured: true, changed: true };
    }

    if (validateClerkWebhookSigningSecret(convexSigningSecret) === null) {
      console.log("✓ Convex CLERK_WEBHOOK_SIGNING_SECRET already set");
      return { configured: true, changed: false };
    }

    console.log(
      "○ Convex CLERK_WEBHOOK_SIGNING_SECRET is invalid — create a new endpoint",
    );
  }

  const manualSteps = clerkWebhookManualSteps(webhookUrl, events);

  printManualAction(
    "Add Clerk webhook endpoint for Convex profile sync",
    interactive
      ? manualSteps
      : [
          ...manualSteps.slice(0, -1),
          "Re-run `bun run setup` interactively to paste the signing secret, or set CLERK_WEBHOOK_SIGNING_SECRET in apps/web/.env.local",
        ],
    { immediate: interactive },
  );

  if (!interactive) {
    return { configured: svixApp.ok, changed: false };
  }

  const opened = await openUrlInBrowser(CLERK_WEBHOOKS);
  if (opened) {
    console.log("✓ Opened Clerk webhooks in browser");
  } else {
    console.log(`  Open manually: ${CLERK_WEBHOOKS}`);
  }

  const existingWebSecret = webEnv.CLERK_WEBHOOK_SIGNING_SECRET;
  const rawSecret = await promptSecret(
    "CLERK_WEBHOOK_SIGNING_SECRET (whsec_…)",
    {
      defaultValue: isPlaceholderEnvValue(existingWebSecret)
        ? undefined
        : existingWebSecret,
      displayDefault:
        existingWebSecret && !isPlaceholderEnvValue(existingWebSecret)
          ? maskSecret(existingWebSecret)
          : undefined,
      label: "CLERK_WEBHOOK_SIGNING_SECRET",
      required: true,
      hint: "Paste signing secret from the webhook endpoint you created above",
      validate: validateClerkWebhookSigningSecret,
    },
  );
  webSigningSecret = normalizeEnvPaste(
    "CLERK_WEBHOOK_SIGNING_SECRET",
    rawSecret,
  ).trim();

  if (!webSigningSecret) {
    exitWithManualAction("Configure Clerk webhook signing secret", [
      ...manualSteps,
      `Save as CLERK_WEBHOOK_SIGNING_SECRET in ${WEB_ENV}`,
      "Re-run `bun run setup`",
    ]);
  }

  upsertEnvKeys(root, WEB_ENV, {
    CLERK_WEBHOOK_SIGNING_SECRET: webSigningSecret,
  });
  console.log(`✓ Saved CLERK_WEBHOOK_SIGNING_SECRET → ${WEB_ENV}`);

  return syncSigningSecretToConvex(root, webSigningSecret);
}
