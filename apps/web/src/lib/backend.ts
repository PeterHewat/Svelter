import { isPlaceholderEnvValue } from "@repo/config/env-placeholders";
import { loadWebEnv } from "./web-env";

/**
 * Whether Convex is configured with a real deployment URL.
 */
export function isBackendEnabled(): boolean {
  const { convexUrl } = loadWebEnv();
  return Boolean(convexUrl && !isPlaceholderEnvValue(convexUrl));
}

/**
 * Whether Clerk + Convex are configured for sign-in.
 */
export function isAuthEnabled(): boolean {
  const { convexUrl, clerkPublishableKey } = loadWebEnv();
  return (
    Boolean(convexUrl && !isPlaceholderEnvValue(convexUrl)) &&
    Boolean(clerkPublishableKey && !isPlaceholderEnvValue(clerkPublishableKey))
  );
}
