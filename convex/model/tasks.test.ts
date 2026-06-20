import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";
import type { Id } from "../_generated/dataModel";
import { getOwnedTask } from "./tasks";

const taskId = "task_abc" as Id<"tasks">;
const userA = "user_a_doc" as Id<"users">;
const userB = "user_b_doc" as Id<"users">;

const ownedTask = {
  _id: taskId,
  userId: userA,
  title: "Mine",
  description: undefined,
  completed: false,
  createdAt: 0,
  updatedAt: 0,
};

describe("getOwnedTask", () => {
  it("returns the task when the user owns it", async () => {
    const db = {
      get: async () => ownedTask,
    };

    await expect(getOwnedTask(db, taskId, userA)).resolves.toEqual(ownedTask);
  });

  it("throws when the task is missing", async () => {
    const db = { get: async () => null };

    await expect(getOwnedTask(db, taskId, userA)).rejects.toThrow(ConvexError);
    await expect(getOwnedTask(db, taskId, userA)).rejects.toThrow(
      "Task not found",
    );
  });

  it("throws when another user owns the task", async () => {
    const db = { get: async () => ownedTask };

    await expect(getOwnedTask(db, taskId, userB)).rejects.toThrow(ConvexError);
    await expect(getOwnedTask(db, taskId, userB)).rejects.toThrow(
      "Not authorized",
    );
  });
});
