/* eslint-disable no-console -- CLI */
import { isPlaceholderEnvValue } from "../../packages/config/env-placeholders";
import { resolveClerkIssuerDomain } from "./clerk-instance";
import {
  PUBLIC_CONVEX_URL,
  readClerkPublishableKey,
  readConvexUrlFromWebEnv,
} from "./clerk-web-env";
import { isConvexLinked } from "./convex-link";
import { getConvexEnvVar, setConvexEnvVar } from "./convex-env";
import { readConvexUrlFromRootEnv } from "./convex-url";
import { readEnvFile, upsertEnvKeys } from "./env-file";

const WEB_ENV = "apps/web/.env.local";

export type SyncClerkConvexResult = {
  issuerConfigured: boolean;
  issuerChanged: boolean;
};

/**
 * Pushes Clerk issuer to Convex and syncs `PUBLIC_CONVEX_URL` into `apps/web/.env.local` when possible.
 *
 * @param root - Repository root
 * @param options - Optional pre-resolved issuer (skips re-derivation)
 * @returns Whether the issuer is configured and whether it changed this run
 */
export async function syncClerkConvexFromWebEnv(
  root: string,
  options?: { issuerDomain?: string },
): Promise<SyncClerkConvexResult> {
  const unchanged: SyncClerkConvexResult = {
    issuerConfigured: false,
    issuerChanged: false,
  };

  if (!isConvexLinked(root)) {
    return unchanged;
  }

  const webEnv = readEnvFile(root, WEB_ENV);
  let issuerDomain = options?.issuerDomain ?? null;
  const publishableKey = readClerkPublishableKey(webEnv);
  if (
    !issuerDomain &&
    publishableKey &&
    !isPlaceholderEnvValue(publishableKey)
  ) {
    issuerDomain = await resolveClerkIssuerDomain(
      publishableKey,
      isPlaceholderEnvValue(webEnv.CLERK_SECRET_KEY)
        ? undefined
        : webEnv.CLERK_SECRET_KEY,
    );
  }

  const convexUrl = readConvexUrlFromRootEnv(root);
  if (convexUrl) {
    const currentUrl = readConvexUrlFromWebEnv(readEnvFile(root, WEB_ENV));
    if (isPlaceholderEnvValue(currentUrl) || currentUrl !== convexUrl) {
      upsertEnvKeys(root, WEB_ENV, { [PUBLIC_CONVEX_URL]: convexUrl });
      console.log(`✓ Set ${WEB_ENV} ${PUBLIC_CONVEX_URL} → ${convexUrl}`);
    }
  }

  if (!issuerDomain) {
    return unchanged;
  }

  const existing = await getConvexEnvVar(root, "CLERK_JWT_ISSUER_DOMAIN");
  if (existing === issuerDomain) {
    return { issuerConfigured: true, issuerChanged: false };
  }

  const { ok } = await setConvexEnvVar(
    root,
    "CLERK_JWT_ISSUER_DOMAIN",
    issuerDomain,
    false,
  );
  if (ok) {
    console.log("✓ Convex CLERK_JWT_ISSUER_DOMAIN set on dev deployment");
  }
  return { issuerConfigured: ok, issuerChanged: ok };
}
