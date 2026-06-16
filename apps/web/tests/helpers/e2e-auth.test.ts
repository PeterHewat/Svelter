import { afterEach, describe, expect, it } from "vitest";
import {
  getTasksE2EConfigIssues,
  isPlaywrightUiOnly,
  isTasksE2EConfigured,
} from "./e2e-auth";

const ENV_KEYS = [
  "PUBLIC_CONVEX_URL",
  "PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "E2E_USER_EMAIL",
  "PLAYWRIGHT_UI_ONLY",
] as const;

function setValidE2EEnv(): void {
  process.env.PUBLIC_CONVEX_URL = "https://happy-animal-123.convex.cloud";
  process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_example";
  process.env.CLERK_SECRET_KEY = "sk_test_example";
  process.env.E2E_USER_EMAIL = "e2e.test@example.org";
}

describe("e2e-auth", () => {
  afterEach(() => {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
  });

  it("reports placeholder env issues", () => {
    process.env.PUBLIC_CONVEX_URL = "https://your-project.convex.cloud";
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_live_not_dev";
    process.env.E2E_USER_EMAIL = "e2e.test@your-domain.com";

    const issues = getTasksE2EConfigIssues();
    expect(issues.some((issue) => issue.includes("PUBLIC_CONVEX_URL"))).toBe(
      true,
    );
    expect(
      issues.some((issue) => issue.includes("PUBLIC_CLERK_PUBLISHABLE_KEY")),
    ).toBe(true);
    expect(issues.some((issue) => issue.includes("E2E_USER_EMAIL"))).toBe(true);
    expect(issues.some((issue) => issue.includes("CLERK_SECRET_KEY"))).toBe(
      true,
    );
    expect(isTasksE2EConfigured()).toBe(false);
  });

  it("accepts valid development env", () => {
    setValidE2EEnv();
    expect(getTasksE2EConfigIssues()).toEqual([]);
    expect(isTasksE2EConfigured()).toBe(true);
  });

  it("accepts default E2E email when no apex domain is configured", () => {
    setValidE2EEnv();
    process.env.E2E_USER_EMAIL = "e2e.test@example.com";
    expect(getTasksE2EConfigIssues()).toEqual([]);
    expect(isTasksE2EConfigured()).toBe(true);
  });

  it("honors PLAYWRIGHT_UI_ONLY override", () => {
    setValidE2EEnv();
    process.env.PLAYWRIGHT_UI_ONLY = "1";
    expect(isPlaywrightUiOnly()).toBe(true);
    expect(getTasksE2EConfigIssues()).toEqual([]);
    process.env.PLAYWRIGHT_UI_ONLY = "0";
    expect(isPlaywrightUiOnly()).toBe(false);
  });
});
