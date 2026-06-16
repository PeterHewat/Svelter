import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { UserIdentity } from "convex/server";

/**
 * Requires a signed-in user for queries and mutations.
 *
 * @param ctx - Convex query or mutation context
 * @returns Clerk identity from the validated JWT
 * @throws ConvexError when there is no authenticated user
 */
export async function requireIdentity(
  ctx: QueryCtx | MutationCtx,
): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }
  return identity;
}

/**
 * Requires a signed-in user and returns their stable Clerk user id (`subject`).
 *
 * @param ctx - Convex query or mutation context
 * @returns Clerk user id for scoping owned data
 * @throws ConvexError when there is no authenticated user
 */
export async function requireUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const identity = await requireIdentity(ctx);
  return identity.subject;
}
