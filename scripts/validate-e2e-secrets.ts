#!/usr/bin/env bun
/* eslint-disable no-console -- CI resolver writes GitHub Actions output */
/**
 * Resolves web Playwright E2E mode for CI (`ui_only` vs full tasks suite).
 */
import { getTasksE2EConfigIssues } from "../apps/web/tests/helpers/e2e-auth-config.ts";
import { verifyClerkE2ESecrets } from "./lib/e2e-secrets.ts";
import { readClerkPublishableKey } from "./lib/clerk-web-env.ts";
import { readEnvFile } from "./lib/env-file.ts";

const requireFull = process.env.REQUIRE_FULL_WEB_E2E === "true";

function fail(message: string): never {
  if (requireFull) {
    console.error(`::error::${message}`);
    process.exit(1);
  }
  console.log("ui_only=true");
  console.error(
    `::notice::${message} Running UI-only Playwright (home, routing).`,
  );
  process.exit(0);
}

const syncIssues = getTasksE2EConfigIssues();
if (syncIssues.length > 0) {
  fail(
    `Web E2E secrets incomplete: ${syncIssues.join("; ")}. Set repository secrets via \`bun run setup\` (docs/ci-cd.md#repository-secrets).`,
  );
}

const publishableKey =
  process.env.PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ||
  readClerkPublishableKey(readEnvFile(process.cwd(), "apps/web/.env.local")) ||
  "";
const secretKey = process.env.CLERK_SECRET_KEY!.trim();
const clerkCheck = await verifyClerkE2ESecrets(publishableKey, secretKey);
if (!clerkCheck.ok) {
  fail(clerkCheck.message);
}

if (clerkCheck.jwtTemplateCreated) {
  console.error(
    '::notice::Created Clerk JWT template "convex" on the development instance (required for Convex auth in Playwright).',
  );
}

console.log("ui_only=false");
