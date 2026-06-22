import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Starter schema — extend or replace tables for your domain.
 *
 * @see https://docs.convex.dev/database/schemas
 */
export default defineSchema({
  users: defineTable({
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    /** JWT `sub` — `anon_…` for guests, Clerk user id when signed in. */
    tokenIdentifier: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_token", ["tokenIdentifier"]),
  tasks: defineTable({
    title: v.string(),
    completed: v.boolean(),
    userId: v.id("users"),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_completed", ["completed"]),
});
