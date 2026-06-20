import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { isAnonymousIdentity, isAnonymousSubject } from "../lib/anon_auth";
import { ANON_USER_ID_PREFIX } from "../lib/constants";
import type { UserIdentity } from "convex/server";

type UsersCtx = Pick<QueryCtx | MutationCtx, "db">;

export type UserProfile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
};

/**
 * @param profile - User profile fields
 * @returns Full display name when first or last name is set
 */
export function formatUserDisplayName(
  profile: Pick<UserProfile, "firstName" | "lastName">,
): string | undefined {
  const parts = [profile.firstName, profile.lastName].filter(
    (part): part is string => Boolean(part?.trim()),
  );
  return parts.length > 0 ? parts.join(" ") : undefined;
}

/**
 * @param user - User document
 * @returns True when the user is a guest (no Clerk account linked yet)
 */
export function isGuestUser(user: Doc<"users">): boolean {
  return user.clerkUserId === undefined;
}

/**
 * Loads a user by JWT subject or returns null.
 *
 * @param ctx - Database context
 * @param tokenIdentifier - JWT `sub`
 */
export async function getUserByToken(
  ctx: UsersCtx,
  tokenIdentifier: string,
): Promise<Doc<"users"> | null> {
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
    .unique();
}

/**
 * Extracts profile fields from a Clerk Convex JWT (`convex` template claims).
 *
 * @param identity - Validated JWT identity
 */
export function profileFromIdentity(identity: UserIdentity): UserProfile {
  const claims = identity as UserIdentity & {
    givenName?: string;
    familyName?: string;
    given_name?: string;
    family_name?: string;
    /** Clerk `name` claim when given/family names are absent */
    name?: string;
    email?: string;
    /** OIDC `picture` claim when present on the raw JWT */
    picture?: string;
    /** Convex maps Clerk/OIDC `picture` to `pictureUrl` on `getUserIdentity()` */
    pictureUrl?: string;
  };

  let firstName =
    claims.givenName?.trim() || claims.given_name?.trim() || undefined;
  let lastName =
    claims.familyName?.trim() || claims.family_name?.trim() || undefined;

  if (!firstName && !lastName && claims.name?.trim()) {
    const parts = claims.name.trim().split(/\s+/);
    firstName = parts[0];
    lastName = parts.slice(1).join(" ") || undefined;
  }

  const imageUrl =
    claims.pictureUrl?.trim() || claims.picture?.trim() || undefined;

  return {
    firstName,
    lastName,
    email: claims.email?.trim() || undefined,
    imageUrl,
  };
}

type ClerkWebhookUser = {
  first_name?: string | null;
  last_name?: string | null;
  email_addresses?: Array<{ email_address: string }>;
  image_url?: string | null;
  profile_image_url?: string | null;
};

/**
 * Extracts profile fields from a Clerk webhook user payload.
 *
 * @param data - Clerk `user.*` event body
 */
export function profileFromClerkWebhook(data: ClerkWebhookUser): UserProfile {
  return {
    firstName: data.first_name?.trim() || undefined,
    lastName: data.last_name?.trim() || undefined,
    email: data.email_addresses?.[0]?.email_address,
    imageUrl: data.image_url ?? data.profile_image_url ?? undefined,
  };
}

function resolveProfileField<T>(
  mode: "fillMissing" | "overwrite",
  incoming: T | undefined,
  existing: T | undefined,
): T | undefined {
  return mode === "overwrite" ? incoming : (incoming ?? existing);
}

/**
 * Writes profile fields on a user document.
 *
 * @param ctx - Mutation context
 * @param userId - Target user
 * @param profile - Profile fields to apply
 * @param mode - `fillMissing` keeps existing values; `overwrite` replaces from Clerk
 */
export async function applyUserProfile(
  ctx: MutationCtx,
  userId: Id<"users">,
  profile: UserProfile,
  mode: "fillMissing" | "overwrite",
): Promise<void> {
  const user = await ctx.db.get(userId);
  if (!user) {
    return;
  }

  const now = Date.now();
  await ctx.db.patch(userId, {
    firstName: resolveProfileField(mode, profile.firstName, user.firstName),
    lastName: resolveProfileField(mode, profile.lastName, user.lastName),
    email: resolveProfileField(mode, profile.email, user.email),
    imageUrl: resolveProfileField(mode, profile.imageUrl, user.imageUrl),
    updatedAt: now,
  });
}

/**
 * Ensures a `users` row exists for the authenticated identity.
 *
 * @param ctx - Mutation context
 * @param identity - Validated JWT identity
 * @returns The user document
 */
export async function getOrCreateUserFromIdentity(
  ctx: MutationCtx,
  identity: UserIdentity,
): Promise<Doc<"users">> {
  const tokenIdentifier = identity.subject;
  const existing = await getUserByToken(ctx, tokenIdentifier);
  const profile = profileFromIdentity(identity);
  const now = Date.now();

  if (existing) {
    if (!isGuestUser(existing)) {
      await applyUserProfile(ctx, existing._id, profile, "fillMissing");
    }
    return (await ctx.db.get(existing._id)) ?? existing;
  }

  const isGuest = isAnonymousIdentity(identity);
  const id = await ctx.db.insert("users", {
    tokenIdentifier,
    clerkUserId: isGuest ? undefined : tokenIdentifier,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    imageUrl: profile.imageUrl,
    createdAt: now,
    updatedAt: now,
  });

  const created = await ctx.db.get(id);
  if (!created) {
    throw new ConvexError("Failed to create user");
  }
  return created;
}

/**
 * Upserts a Clerk account row from webhook data (authoritative profile sync).
 *
 * @param ctx - Mutation context
 * @param clerkUserId - Clerk user id
 * @param profile - Profile from webhook payload
 */
export async function upsertClerkUserFromWebhook(
  ctx: MutationCtx,
  clerkUserId: string,
  profile: UserProfile,
): Promise<Id<"users">> {
  const tokenIdentifier = clerkUserId;
  const now = Date.now();
  const existing = await getUserByToken(ctx, tokenIdentifier);

  if (existing) {
    await ctx.db.patch(existing._id, {
      clerkUserId,
      updatedAt: now,
    });
    await applyUserProfile(ctx, existing._id, profile, "overwrite");
    return existing._id;
  }

  return await ctx.db.insert("users", {
    tokenIdentifier,
    clerkUserId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    imageUrl: profile.imageUrl,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Generates a new anonymous owner token identifier.
 */
export function createAnonymousUserId(): string {
  return `${ANON_USER_ID_PREFIX}${crypto.randomUUID()}`;
}

/**
 * @param tokenIdentifier - Guest token from localStorage / JWT `sub`
 * @returns True when the value looks like a guest id
 */
export function isGuestTokenIdentifier(tokenIdentifier: string): boolean {
  return isAnonymousSubject(tokenIdentifier);
}
