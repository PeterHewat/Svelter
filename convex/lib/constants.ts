/** Maximum tasks an anonymous (guest) user may create in the demo. */
export const ANONYMOUS_TASK_LIMIT = 3;

/** Maximum tasks a signed-in user may create in the demo. */
export const SIGNED_IN_TASK_LIMIT = 10;

/** JWT audience for anonymous and Clerk Convex tokens. */
export const CONVEX_JWT_AUDIENCE = "convex";

/** Prefix for anonymous user ids stored as JWT `sub` / `tasks.userId`. */
export const ANON_USER_ID_PREFIX = "anon_";
