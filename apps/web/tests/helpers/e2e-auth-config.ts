import { isPlaceholderE2eEmail } from "@repo/config/e2e-auth";
import { isPlaceholderEnvValue } from "@repo/config/env-placeholders";

/** Error message when authenticated tasks E2E env is incomplete. */
export const tasksE2EEnvMessage =
  "Set CLERK_SECRET_KEY, E2E_USER_EMAIL, PUBLIC_CONVEX_URL, and PUBLIC_CLERK_PUBLISHABLE_KEY in apps/web/.env.local — see docs/development.md#e2e-tests-playwright";

/**
 * Clerk publishable key for `@clerk/testing` (maps from PUBLIC_* in CI/local).
 */
export function clerkPublishableKeyForE2E(): string | undefined {
  return (
    process.env.CLERK_PUBLISHABLE_KEY ??
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY
  );
}

/**
 * Returns human-readable issues when tasks E2E env is missing or misconfigured.
 */
export function getTasksE2EConfigIssues(): string[] {
  if (process.env.PLAYWRIGHT_UI_ONLY === "1") {
    return [];
  }

  const issues: string[] = [];
  const publishableKey = clerkPublishableKeyForE2E();
  const convexUrl = process.env.PUBLIC_CONVEX_URL?.trim();
  const email = process.env.E2E_USER_EMAIL?.trim();
  const secret = process.env.CLERK_SECRET_KEY?.trim();

  if (!publishableKey || isPlaceholderEnvValue(publishableKey)) {
    issues.push(
      "PUBLIC_CLERK_PUBLISHABLE_KEY is missing or still a placeholder",
    );
  } else if (!publishableKey.startsWith("pk_test_")) {
    issues.push(
      "PUBLIC_CLERK_PUBLISHABLE_KEY must be a development key (pk_test_…) — production keys cannot run Playwright auth",
    );
  }

  if (!secret || isPlaceholderEnvValue(secret)) {
    issues.push("CLERK_SECRET_KEY is missing or still a placeholder");
  } else if (!secret.startsWith("sk_test_")) {
    issues.push(
      "CLERK_SECRET_KEY must be a development key (sk_test_…) — the Clerk testing token API rejects production keys",
    );
  }

  if (!convexUrl || isPlaceholderEnvValue(convexUrl)) {
    issues.push("PUBLIC_CONVEX_URL is missing or still a placeholder");
  }

  if (!email || isPlaceholderE2eEmail(email)) {
    issues.push("E2E_USER_EMAIL is missing or still a placeholder");
  }

  return issues;
}

/**
 * Returns true when Clerk + Convex env is set for authenticated tasks E2E.
 */
export function isTasksE2EConfigured(): boolean {
  return getTasksE2EConfigIssues().length === 0;
}

/**
 * When true, Playwright runs only `home` / `routing` specs (no Clerk tasks).
 */
export function isPlaywrightUiOnly(): boolean {
  if (process.env.PLAYWRIGHT_UI_ONLY === "1") return true;
  if (process.env.PLAYWRIGHT_UI_ONLY === "0") return false;
  return !isTasksE2EConfigured();
}

/**
 * Converts a Convex cloud deployment URL to the HTTP actions (`.convex.site`) origin.
 *
 * @param convexCloudUrl - `PUBLIC_CONVEX_URL` value
 */
export function convexSiteUrlForE2E(convexCloudUrl: string): string {
  const url = new URL(convexCloudUrl);
  if (url.hostname.endsWith(".convex.cloud")) {
    url.hostname = url.hostname.replace(".convex.cloud", ".convex.site");
  }
  return url.origin;
}

/**
 * Verifies the linked Convex dev deployment has pushed functions (HTTP actions).
 *
 * Tasks E2E needs Convex auth (`auth.config.ts` + `/auth/anonymous`). When functions
 * were never pushed, the app stays on "Loading..." and Playwright times out on the
 * Tasks heading.
 *
 * @throws When the deployment is unreachable or HTTP actions are not enabled
 */
export async function verifyConvexDeploymentForTasksE2E(): Promise<void> {
  const convexUrl = process.env.PUBLIC_CONVEX_URL?.trim();
  if (!convexUrl || isPlaceholderEnvValue(convexUrl)) {
    return;
  }

  const siteUrl = convexSiteUrlForE2E(convexUrl);
  const origin =
    process.env.PLAYWRIGHT_BASE_URL?.trim() ?? "http://localhost:3000";

  let response: Response;
  try {
    response = await fetch(`${siteUrl}/auth/anonymous`, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
      },
    });
  } catch (error) {
    throw new Error(
      `Cannot reach Convex HTTP actions at ${siteUrl}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }

  const body = await response.text();
  if (response.status === 404 && body.includes("HTTP actions")) {
    throw new Error(
      "Convex deployment does not have HTTP actions enabled — push functions with `bun run dev:convex` from the repo root (see docs/getting-started.md)",
    );
  }

  if (!response.ok && response.status !== 200 && response.status !== 204) {
    throw new Error(
      `Convex anonymous auth preflight failed (${response.status}) at ${siteUrl}/auth/anonymous`,
    );
  }
}
