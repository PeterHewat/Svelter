/* eslint-disable no-console -- CLI output */
import { CLERK_DASHBOARD } from "./platform-urls";

export type SetupStack = "development" | "production";

/**
 * Short badge text for which runtime tier a setup step configures.
 *
 * @param stack - Development (local/staging) or Production (release-*)
 */
export function setupStackBadge(stack: SetupStack): string {
  return stack === "development"
    ? "Development — local dev, PR CI, merge-to-main staging"
    : "Production — release-* tags only (not staging)";
}

/**
 * Prints a setup section header with an explicit stack badge.
 *
 * @param stack - Which tier this step configures
 * @param title - Section title
 * @param detail - Optional one-line context
 */
export function logSetupStackSection(
  stack: SetupStack,
  title: string,
  detail?: string,
): void {
  console.log(`\n▸ ${title}`);
  console.log(`  Stack: ${setupStackBadge(stack)}`);
  if (detail) {
    console.log(`  ${detail}`);
  }
}

export type SetupStackSummaryInput = {
  hasApex: boolean;
  productionSecretsSynced: boolean;
  cloudflareDnsConfigured: boolean;
  cloudflareSynced: boolean;
};

/**
 * Prints what is ready for Development vs Production after setup finishes or pauses.
 *
 * @param input - Flags from `.svelter/setup.json` after bootstrap steps
 */
export function printSetupStackSummary(input: SetupStackSummaryInput): void {
  console.log("\nSetup stack summary");
  console.log(
    "  Development — Clerk pk_test_ + Convex dev in apps/web/.env.local; repo GitHub secrets for PR CI and staging",
  );

  if (input.productionSecretsSynced) {
    console.log(
      "  Production — GitHub `production` environment has Convex prod URL, deploy key, and Clerk pk_live_",
    );
    if (
      input.hasApex &&
      input.cloudflareSynced &&
      input.cloudflareDnsConfigured
    ) {
      console.log(
        "  Production hosting — Cloudflare Pages + apex DNS configured for release deploys",
      );
    } else if (input.hasApex && input.cloudflareSynced) {
      console.log(
        "  Production hosting — Pages projects exist; finish registrar nameservers and re-run setup",
      );
    } else if (input.cloudflareSynced) {
      console.log(
        "  Production hosting — Pages on *.pages.dev; add an apex in setup for custom domains",
      );
    }
    return;
  }

  if (input.hasApex) {
    console.log(
      "  Production — incomplete (setup paused or Clerk/Cloudflare step not finished); re-run `bun run setup`",
    );
    console.log(
      "  Release web sign-in needs pk_live_ synced — staging on main still uses Development keys",
    );
    return;
  }

  console.log(
    "  Production — partial: Convex prod + Pages may be synced; Clerk Production deferred (no apex domain)",
  );
  console.log(
    "  Add an apex domain in setup for pk_live_ and custom production sign-in",
  );
}

/**
 * Prefix for Clerk dashboard manual steps so Development vs Production is explicit.
 *
 * @param stack - Clerk instance to use in the dashboard
 */
export function clerkDashboardInstanceStep(stack: SetupStack): string {
  const instance = stack === "development" ? "Development" : "Production";
  return `Clerk dashboard (${CLERK_DASHBOARD}) — select **${instance}** in the instance switcher (top bar)`;
}
