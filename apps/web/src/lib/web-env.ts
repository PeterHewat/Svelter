import { asString, loadEnv } from "@repo/utils/env";

const webEnvSchema = {
  convexUrl: { key: "PUBLIC_CONVEX_URL", parse: asString },
  clerkPublishableKey: {
    key: "PUBLIC_CLERK_PUBLISHABLE_KEY",
    parse: asString,
  },
} as const;

/**
 * Reads SvelteKit public env vars. Does not throw — safe before Convex is linked.
 */
export function loadWebEnv() {
  return loadEnv(
    {
      convexUrl: { ...webEnvSchema.convexUrl, optional: true },
      clerkPublishableKey: {
        ...webEnvSchema.clerkPublishableKey,
        optional: true,
      },
    },
    {
      PUBLIC_CONVEX_URL: import.meta.env.PUBLIC_CONVEX_URL,
      PUBLIC_CLERK_PUBLISHABLE_KEY: import.meta.env
        .PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
  );
}

/**
 * Validates required web env when enabling Convex + Clerk.
 *
 * @throws Error when required vars are missing or empty
 */
export function requireWebEnv() {
  return loadEnv(webEnvSchema, {
    PUBLIC_CONVEX_URL: import.meta.env.PUBLIC_CONVEX_URL,
    PUBLIC_CLERK_PUBLISHABLE_KEY: import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
  });
}
