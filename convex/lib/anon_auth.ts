import type { UserIdentity } from "convex/server";
import { ANON_USER_ID_PREFIX } from "./constants";
import { requireEnv } from "./env";

/**
 * Issuer URL for anonymous JWTs (the deployment `.convex.site` origin).
 */
export function getAnonAuthIssuer(): string {
  return requireEnv("ANON_AUTH_ISSUER");
}

/**
 * PEM-encoded RS256 private key for signing anonymous JWTs.
 */
export function getAnonPrivateKeyPem(): string {
  return requireEnv("ANON_AUTH_PRIVATE_KEY");
}

/**
 * Base64 data URI JWKS document for `auth.config.ts` customJwt provider.
 */
export function getAnonJwksDataUri(): string {
  return requireEnv("ANON_AUTH_JWKS");
}

/**
 * @param subject - JWT subject / owner id
 * @returns True when the id belongs to an anonymous guest user
 */
export function isAnonymousSubject(subject: string): boolean {
  return subject.startsWith(ANON_USER_ID_PREFIX);
}

/**
 * @param identity - Validated Convex user identity
 * @returns True when the caller is an anonymous guest (not Clerk)
 */
export function isAnonymousIdentity(identity: UserIdentity): boolean {
  const anonIssuer = process.env.ANON_AUTH_ISSUER?.trim();
  if (anonIssuer && identity.issuer === anonIssuer) {
    return true;
  }
  return isAnonymousSubject(identity.subject);
}
