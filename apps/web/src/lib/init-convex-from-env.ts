import { setupConvex } from "convex-svelte";
import { isBackendEnabled } from "$lib/backend";
import { loadWebEnv } from "$lib/web-env";

/**
 * Configure Convex during component initialization.
 *
 * Must be called synchronously from a parent `<script>` block — not from
 * promises, `onMount`, or `$effect` (`setupConvex` uses `setContext`).
 */
export function initConvexFromEnv(): void {
  if (!isBackendEnabled()) return;

  const { convexUrl } = loadWebEnv();
  if (convexUrl) {
    setupConvex(convexUrl);
  }
}
