import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4321";

export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.e2e.ts",
  updateSnapshots: "missing",
  maxFailures: isCI ? 5 : undefined,
  workers: isCI ? 2 : undefined,
  retries: isCI ? 1 : 0,
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: isCI ? "off" : "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun run dev",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
  reporter: isCI
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"]],
});
