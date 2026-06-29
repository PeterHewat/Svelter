import { expect, type Page } from "@playwright/test";

export {
  clerkPublishableKeyForE2E,
  convexSiteUrlForE2E,
  getTasksE2EConfigIssues,
  isPlaywrightUiOnly,
  isTasksE2EConfigured,
  tasksE2EEnvMessage,
  verifyConvexDeploymentForTasksE2E,
} from "./e2e-auth-config";

/**
 * Open a route that mounts the deferred Clerk shell before `@clerk/testing` sign-in.
 *
 * `/tasks` requests the auth shell without queuing `openAuthModal` (unlike `/login`,
 * which redirects home and opens the Clerk sign-in dialog — racing ticket sign-in).
 *
 * @param page - Playwright page
 */
export async function gotoClerkReady(page: Page): Promise<void> {
  await page.goto("/tasks");
  await expect(page).toHaveURL("/tasks");
  await page.waitForFunction(() => window.Clerk?.loaded === true, undefined, {
    timeout: 15_000,
  });
}
