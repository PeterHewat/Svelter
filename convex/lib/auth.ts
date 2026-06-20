import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import type { UserIdentity } from "convex/server";
import {
  getOrCreateUserFromIdentity,
  getUserByToken,
  isGuestUser,
} from "../model/users";

/**
 * Requires a signed-in user for queries and mutations.
 *
 * @param ctx - Convex query or mutation context
 * @returns Clerk or anonymous identity from the validated JWT
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
 * Requires authentication and returns the matching `users` row.
 *
 * On mutations, creates the user lazily when missing (Clerk sign-in without webhook).
 *
 * @param ctx - Convex query or mutation context
 * @returns User document for the caller
 */
export async function requireUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const identity = await requireIdentity(ctx);

  if ("insert" in ctx.db) {
    return await getOrCreateUserFromIdentity(ctx as MutationCtx, identity);
  }

  const user = await getUserByToken(ctx, identity.subject);
  if (!user) {
    throw new ConvexError("User not found");
  }
  return user;
}

/**
 * Requires authentication and returns whether the caller is a guest.
 *
 * @param ctx - Convex query or mutation context
 */
export async function requireGuestStatus(
  ctx: QueryCtx | MutationCtx,
): Promise<{ user: Doc<"users">; isGuest: boolean }> {
  const user = await requireUser(ctx);
  return { user, isGuest: isGuestUser(user) };
}
