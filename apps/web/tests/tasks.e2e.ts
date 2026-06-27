import { clerk } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";
import {
  gotoClerkReady,
  isTasksE2EConfigured,
  tasksE2EEnvMessage,
  verifyConvexDeploymentForTasksE2E,
} from "./helpers/e2e-auth";
import { TasksPage } from "./pom/TasksPage";

test.describe("Tasks (Clerk + Convex)", () => {
  test.beforeAll(async () => {
    if (!isTasksE2EConfigured()) {
      throw new Error(tasksE2EEnvMessage);
    }
    await verifyConvexDeploymentForTasksE2E();
  });

  test("sign in, create, toggle complete, delete", async ({ page }) => {
    test.setTimeout(60_000);

    const tasks = new TasksPage(page);
    const title = `E2E task ${Date.now()}`;

    await gotoClerkReady(page);
    await clerk.signIn({
      page,
      emailAddress: process.env.E2E_USER_EMAIL!,
    });

    await tasks.waitForReady();

    await tasks.createTask(title);
    const row = tasks.taskRow(title);
    await expect(row).toBeVisible();

    await tasks.toggleTask(title);
    await expect(row.locator("span.line-through")).toBeVisible();

    await tasks.deleteTask(title);
    await expect(row).toHaveCount(0);
  });
});
