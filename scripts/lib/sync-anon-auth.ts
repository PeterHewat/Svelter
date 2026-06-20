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
 * Ensures anonymous auth env vars exist on the linked Convex deployment.
 *
 * @param root - Repository root
 */
export async function syncAnonymousAuthEnv(
  root: string,
): Promise<SyncAnonAuthResult> {
  const unchanged: SyncAnonAuthResult = { configured: false, changed: false };
  if (!isConvexLinked(root)) {
    return unchanged;
  }

  const convexUrl = readConvexUrlFromRootEnv(root);
  if (!convexUrl || isPlaceholderEnvValue(convexUrl)) {
    return unchanged;
  }

  const issuer = convexSiteUrlFromCloudUrl(convexUrl);
  const existingIssuer = await getConvexEnvVar(root, "ANON_AUTH_ISSUER");
  const existingJwks = await getConvexEnvVar(root, "ANON_AUTH_JWKS");
  const existingPrivateKey = await getConvexEnvVar(
    root,
    "ANON_AUTH_PRIVATE_KEY",
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
      false,
    );
    changed = changed || ok;
  }

  if (!existingJwks) {
    const { ok } = await setConvexEnvVar(
      root,
      "ANON_AUTH_JWKS",
      material.jwksDataUri,
      false,
    );
    changed = changed || ok;
  }

  if (!existingPrivateKey) {
    const { ok } = await setConvexEnvVar(
      root,
      "ANON_AUTH_PRIVATE_KEY",
      material.privateKeyPem,
      false,
    );
    changed = changed || ok;
  }

  if (changed) {
    console.log("✓ Configured Convex anonymous auth env vars");
  }

  return { configured: true, changed };
}
