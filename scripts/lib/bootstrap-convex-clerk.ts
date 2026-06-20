/* eslint-disable no-console -- CLI wizard */
import { bootstrapClerk } from "./bootstrap-clerk";
import { ensureConvexNodeModulesHoisted } from "./convex-node-modules";
import {
  ensureConvexLinkedInteractive,
  pushConvexDevOnce,
} from "./link-convex";
import { printManualAction } from "./manual-action";
import { CONVEX_DASHBOARD } from "./platform-urls";
import { productNameToSlug } from "./repo-identity";
import { syncClerkConvexFromWebEnv } from "./sync-clerk-convex";
import { syncAnonymousAuthEnv } from "./sync-anon-auth";
import { syncClerkWebhookEnv } from "./sync-clerk-webhook";
import type { SetupCliContext } from "./setup-cli";
import type { SetupConfig } from "./setup-config";

/**
 * Links Convex, configures Clerk, and syncs env between Convex and the web app.
 *
 * Clerk runs before Convex linking so the issuer domain is known before the
 * first function push. When Convex linking provisions a deployment but push
 * fails on missing `CLERK_JWT_ISSUER_DOMAIN`, setup sets the env var and retries.
 *
 * @param root - Repository root
 * @param setup - Persisted setup config
 * @param interactive - Whether stdin is a TTY
 * @param cliContext - Optional CLI auth context
 */
export async function bootstrapConvexClerk(
  root: string,
  setup: SetupConfig,
  interactive: boolean,
  cliContext?: SetupCliContext,
): Promise<void> {
  console.log("\nConvex + Clerk");

  const issuerDomain = await bootstrapClerk(
    root,
    setup,
    interactive,
    cliContext,
  );

  const { linked, pushDeferred } = await ensureConvexLinkedInteractive(root, {
    convexAuthenticated: cliContext?.convex.authenticated,
    projectName: setup.productName,
    projectSlug: productNameToSlug(setup.productName),
  });

  if (!linked) {
    printManualAction("Link Convex", [
      "Run: bun run dev:convex",
      `Dashboard: ${CONVEX_DASHBOARD}`,
    ]);
    return;
  }

  if (!(await ensureConvexNodeModulesHoisted(root))) {
    printManualAction("Re-hoist convex/node_modules", [
      "Run from repo root: rm -rf convex/node_modules && bun install",
      "Then: bun run dev:convex",
    ]);
    return;
  }

  const sync = await syncClerkConvexFromWebEnv(root, {
    issuerDomain: issuerDomain ?? undefined,
  });
  const anonSync = await syncAnonymousAuthEnv(root);

  if (sync.issuerChanged || anonSync.changed || pushDeferred) {
    await pushConvexDevOnce(root);
  } else if (sync.issuerConfigured && !anonSync.changed) {
    console.log("✓ Convex auth already configured — skip push");
  } else {
    await pushConvexDevOnce(root);
  }

  const webhookSync = await syncClerkWebhookEnv(root, interactive);
  if (webhookSync.changed) {
    await pushConvexDevOnce(root);
  }
}
