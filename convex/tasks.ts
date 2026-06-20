import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/auth";
import { ANONYMOUS_TASK_LIMIT } from "./lib/constants";
import { isGuestUser } from "./model/users";
import {
  buildTaskInsert,
  buildTaskPatch,
  filterTasksByCompleted,
  getOwnedTask,
} from "./model/tasks";

/**
 * List tasks for the signed-in user, optionally filtered by completion status.
 *
 * @example
 * const tasks = useQuery(api.tasks.list, { completed: false });
 */
export const list = query({
  args: {
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return filterTasksByCompleted(tasks, args.completed);
  },
});

/**
 * Create a task for the signed-in user.
 *
 * @example
 * const createTask = useMutation(api.tasks.create);
 * await createTask({ title: "Buy groceries" });
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (isGuestUser(user)) {
      const existing = await ctx.db
        .query("tasks")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      if (existing.length >= ANONYMOUS_TASK_LIMIT) {
        throw new ConvexError(
          `Guest task limit reached (${ANONYMOUS_TASK_LIMIT})`,
        );
      }
    }

    const now = Date.now();

    return await ctx.db.insert("tasks", buildTaskInsert(args, user._id, now));
  },
});

/**
 * Update a task owned by the signed-in user.
 *
 * @example
 * const updateTask = useMutation(api.tasks.update);
 * await updateTask({ id, title: "Updated title", completed: true });
 */
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const task = await getOwnedTask(ctx.db, args.id, user._id);
    const now = Date.now();

    await ctx.db.patch(args.id, buildTaskPatch(task, args, now));

    return args.id;
  },
});

/**
 * Delete a task owned by the signed-in user.
 *
 * @example
 * const removeTask = useMutation(api.tasks.remove);
 * await removeTask({ id });
 */
export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await getOwnedTask(ctx.db, args.id, user._id);
    await ctx.db.delete(args.id);
    return args.id;
  },
});
