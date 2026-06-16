import { withClerkHandler } from "svelte-clerk/server";
import { isAuthEnabled } from "$lib/backend";

/**
 * Clerk server middleware only when Convex + Clerk are configured.
 * Skipped during CI static fallback generation (placeholder env).
 */
export const handle = isAuthEnabled()
  ? withClerkHandler()
  : async ({ event, resolve }) => resolve(event);
