/* eslint-disable no-console -- CLI */
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { isPlaceholderEnvValue } from "../../packages/config/env-placeholders";
import { getConvexEnvVar, setConvexEnvVar } from "./convex-env";
import { isConvexLinked } from "./convex-link";
import { readConvexUrlFromRootEnv } from "./convex-url";

export type SyncAnonAuthResult = {
  configured: boolean;
  changed: boolean;
};

export type SyncAnonAuthOptions = {
  /** Target the production Convex deployment (`convex env … --prod`). */
  prod?: boolean;
  /** `.convex.cloud` URL for the target deployment; defaults to dev from root `.env.local`. */
  convexCloudUrl?: string;
};

/**
 * Derives the Convex HTTP actions origin from a `.convex.cloud` deployment URL.
 *
 * @param convexCloudUrl - Value of `PUBLIC_CONVEX_URL`
 */
export function convexSiteUrlFromCloudUrl(convexCloudUrl: string): string {
  const url = new URL(convexCloudUrl);
  if (url.hostname.endsWith(".convex.cloud")) {
    url.hostname = url.hostname.replace(".convex.cloud", ".convex.site");
  }
  return url.origin;
}

/**
 * Generates RS256 key material and JWKS data URI for anonymous Convex auth.
 */
export async function generateAnonymousAuthMaterial(): Promise<{
  issuer: string;
  privateKeyPem: string;
  jwksDataUri: string;
}> {
  const { publicKey, privateKey } = await generateKeyPair("RS256", {
    extractable: true,
  });
  const jwk = await exportJWK(publicKey);
  jwk.alg = "RS256";
  jwk.use = "sig";
  jwk.kid = "anon-auth";

  const jwksJson = JSON.stringify({ keys: [jwk] });
  const jwksDataUri = `data:text/plain;charset=utf-8;base64,${Buffer.from(jwksJson).toString("base64")}`;
  const privateKeyPem = await exportPKCS8(privateKey);

  return {
    issuer: "",
    privateKeyPem,
    jwksDataUri,
  };
}

/**
 * Ensures anonymous auth env vars exist on a Convex deployment (dev or production).
 *
 * @param root - Repository root
 * @param options - When `prod` is true, pass the production `PUBLIC_CONVEX_URL`
 */
export async function syncAnonymousAuthEnv(
  root: string,
  options?: SyncAnonAuthOptions,
): Promise<SyncAnonAuthResult> {
  const unchanged: SyncAnonAuthResult = { configured: false, changed: false };
  const prod = options?.prod ?? false;

  if (!prod && !isConvexLinked(root)) {
    return unchanged;
  }

  const convexUrl =
    options?.convexCloudUrl?.trim() || readConvexUrlFromRootEnv(root);
  if (!convexUrl || isPlaceholderEnvValue(convexUrl)) {
    return unchanged;
  }

  const issuer = convexSiteUrlFromCloudUrl(convexUrl);
  const existingIssuer = await getConvexEnvVar(root, "ANON_AUTH_ISSUER", prod);
  const existingJwks = await getConvexEnvVar(root, "ANON_AUTH_JWKS", prod);
  const existingPrivateKey = await getConvexEnvVar(
    root,
    "ANON_AUTH_PRIVATE_KEY",
    prod,
  );

  if (existingIssuer === issuer && existingJwks && existingPrivateKey) {
    return { configured: true, changed: false };
  }

  const material = await generateAnonymousAuthMaterial();
  let changed = false;

  if (existingIssuer !== issuer) {
    const { ok } = await setConvexEnvVar(
      root,
      "ANON_AUTH_ISSUER",
      issuer,
      prod,
    );
    changed = changed || ok;
  }

  if (!existingJwks) {
    const { ok } = await setConvexEnvVar(
      root,
      "ANON_AUTH_JWKS",
      material.jwksDataUri,
      prod,
    );
    changed = changed || ok;
  }

  if (!existingPrivateKey) {
    const { ok } = await setConvexEnvVar(
      root,
      "ANON_AUTH_PRIVATE_KEY",
      material.privateKeyPem,
      prod,
    );
    changed = changed || ok;
  }

  if (changed) {
    console.log(
      `✓ Configured Convex anonymous auth env vars${prod ? " (production)" : ""}`,
    );
  }

  return { configured: true, changed };
}
