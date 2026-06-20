import { isPlaceholderEnvValue } from "../../packages/config/env-placeholders";
import { readEnvFile, upsertEnvKeys } from "./env-file";

/** Canonical SvelteKit public env key for Clerk publishable key. */
export const PUBLIC_CLERK_PUBLISHABLE_KEY = "PUBLIC_CLERK_PUBLISHABLE_KEY";

/** Canonical SvelteKit public env key for Convex URL. */
export const PUBLIC_CONVEX_URL = "PUBLIC_CONVEX_URL";

const WEB_ENV = "apps/web/.env.local";

/**
 * Reads the Clerk publishable key from web env.
 *
 * @param webEnv - Parsed `apps/web/.env.local` contents
 */
export function readClerkPublishableKey(
  webEnv: Record<string, string>,
): string | undefined {
  const value = webEnv[PUBLIC_CLERK_PUBLISHABLE_KEY]?.trim();
  return value || undefined;
}

/**
 * Reads the Convex URL from web env.
 *
 * @param webEnv - Parsed `apps/web/.env.local` contents
 */
export function readConvexUrlFromWebEnv(
  webEnv: Record<string, string>,
): string | undefined {
  const value = webEnv[PUBLIC_CONVEX_URL]?.trim();
  return value || undefined;
}

/**
 * Normalizes Clerk CLI `env pull` output to SvelteKit `PUBLIC_*` keys.
 *
 * @param root - Repository root
 */
export function normalizeClerkPulledWebEnv(root: string): void {
  const webEnv = readEnvFile(root, WEB_ENV);
  const updates: Record<string, string> = {};

  const publishable =
    webEnv[PUBLIC_CLERK_PUBLISHABLE_KEY]?.trim() ||
    webEnv.VITE_CLERK_PUBLISHABLE_KEY?.trim();
  if (publishable && !isPlaceholderEnvValue(publishable)) {
    updates[PUBLIC_CLERK_PUBLISHABLE_KEY] = publishable;
  }

  if (Object.keys(updates).length > 0) {
    upsertEnvKeys(root, WEB_ENV, updates);
  }
}

/**
 * Normalizes production Clerk env pull output to `PUBLIC_*` keys.
 *
 * @param root - Repository root
 * @param relPath - Relative path to pulled env file
 */
export function normalizeClerkProductionEnv(
  root: string,
  relPath: string,
): Record<string, string> {
  const env = readEnvFile(root, relPath);
  const publishable =
    env[PUBLIC_CLERK_PUBLISHABLE_KEY]?.trim() ||
    env.CLERK_PUBLISHABLE_KEY?.trim() ||
    "";
  const secretKey = env.CLERK_SECRET_KEY?.trim() || "";
  const normalized: Record<string, string> = {};
  if (publishable) {
    normalized[PUBLIC_CLERK_PUBLISHABLE_KEY] = publishable;
  }
  if (secretKey) {
    normalized.CLERK_SECRET_KEY = secretKey;
  }
  if (Object.keys(normalized).length > 0) {
    upsertEnvKeys(root, relPath, normalized);
  }
  return { ...env, ...normalized };
}
