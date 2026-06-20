/**
 * True once the Convex client has a confirmed auth token (Clerk or guest).
 */
export const convexAuthReady = $state({
  ready: false,
});
