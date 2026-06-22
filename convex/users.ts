import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { isAnonymousIdentity } from "./lib/anon_auth";
import { ANONYMOUS_TASK_LIMIT } from "./lib/constants";
import { requireIdentity, requireUser } from "./lib/auth";
import {
  applyUserProfile,
  formatUserDisplayName,
  getOrCreateUserFromIdentity,
  getUserByToken,
  isGuestTokenIdentifier,
  isGuestUser,
  profileFromClerkWebhook,
  profileFromIdentity,
  upsertClerkUserFromWebhook,
} from "./model/users";

/**
 * Guest vs signed-in task quota for the tasks demo UI.
 */
export const accountStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const isGuest = isGuestUser(user);

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return {
      isGuest,
      taskCount: tasks.length,
      taskLimit: isGuest ? ANONYMOUS_TASK_LIMIT : null,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: formatUserDisplayName(user),
      email: user.email,
      imageUrl: user.imageUrl,
    };
  },
});

/**
 * Ensures a Clerk user row exists and seeds profile fields from the JWT.
 *
 * Call after Clerk sign-in when there is no guest session to merge.
 */
export const syncCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    if (isAnonymousIdentity(identity)) {
      throw new ConvexError("Clerk account required");
    }
    const user = await getOrCreateUserFromIdentity(ctx, identity);
    return user._id;
  },
});

/**
 * Merges a guest session into the signed-in Clerk account.
 *
 * First sign-up upgrades the guest row in place. Returning users merge guest
 * tasks into the existing account and delete the ephemeral guest row.
 *
 * @example
 * await client.mutation(api.users.mergeGuestSessionIntoAccount, {
 *   guestTokenIdentifier: readStoredAnonUserId(),
 * });
 */
export const mergeGuestSessionIntoAccount = mutation({
  args: {
    guestTokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    if (isAnonymousIdentity(identity)) {
      throw new ConvexError("Sign in with a full account first");
    }

    const clerkSubject = identity.subject;
    if (!isGuestTokenIdentifier(args.guestTokenIdentifier)) {
      return { migratedTaskCount: 0, upgradedInPlace: false };
    }

    const guestUser = await getUserByToken(ctx, args.guestTokenIdentifier);
    if (!guestUser || !isGuestUser(guestUser)) {
      return { migratedTaskCount: 0, upgradedInPlace: false };
    }

    const profile = profileFromIdentity(identity);
    const now = Date.now();
    const guestTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", guestUser._id))
      .collect();

    const existingAccount = await getUserByToken(ctx, clerkSubject);

    if (!existingAccount) {
      await ctx.db.patch(guestUser._id, {
        tokenIdentifier: clerkSubject,
        updatedAt: now,
      });
      await applyUserProfile(ctx, guestUser._id, profile, "fillMissing");

      return {
        migratedTaskCount: guestTasks.length,
        upgradedInPlace: true,
      };
    }

    for (const task of guestTasks) {
      await ctx.db.patch(task._id, { userId: existingAccount._id });
    }

    await ctx.db.delete(guestUser._id);
    await applyUserProfile(ctx, existingAccount._id, profile, "fillMissing");

    return {
      migratedTaskCount: guestTasks.length,
      upgradedInPlace: false,
    };
  },
});

type ClerkUserPayload = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email_addresses?: Array<{ email_address: string }>;
  image_url?: string | null;
  profile_image_url?: string | null;
};

/**
 * Upserts a Clerk user profile from a webhook event.
 */
export const upsertFromClerk = internalMutation({
  args: {
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const data = args.data as ClerkUserPayload;
    const profile = profileFromClerkWebhook(data);
    return await upsertClerkUserFromWebhook(ctx, data.id, profile);
  },
});

/**
 * Removes a Clerk user synced from webhooks.
 */
export const deleteFromClerk = internalMutation({
  args: {
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.tokenIdentifier);
    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

/**
 * Creates a guest user row before minting an anonymous JWT.
 */
export const createAnonymousUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await getUserByToken(ctx, args.tokenIdentifier);
    if (existing) {
      if (!isGuestUser(existing)) {
        throw new ConvexError("Invalid guest user");
      }
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Validates an existing guest id before refreshing its JWT.
 */
export const validateAnonymousUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.tokenIdentifier);
    if (!user || !isGuestUser(user)) {
      throw new ConvexError("Invalid guest user");
    }
    return user._id;
  },
});
