/* eslint-disable no-console -- CLI wizard */
import { deriveHostnames } from "../../packages/config/hostnames";
import { hasApexDomain } from "../../packages/config/validate-domain";
import { resolveGitHubRepo } from "./apply-identity";
import {
  deployClerkProduction,
  pullClerkProductionEnv,
  readLinkedClerkAppId,
} from "./clerk-cli";
import {
  isClerkPublishableKey,
  isClerkSecretKey,
  issuerFromPublishableKey,
  mergeClerkAllowedOrigins,
  normalizeClerkIssuerDomain,
  resolveClerkIssuerDomain,
} from "./clerk-instance";
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "./clerk-web-env";
import { mintConvexDeployKey } from "./convex-deploy-key";
import { setConvexEnvVar } from "./convex-env";
import {
  convexUrlFromDeploymentSlug,
  readConvexUrlFromRootEnv,
} from "./convex-url";
import { normalizeEnvPaste } from "./env-paste";
import { isConvexLinked } from "./convex-link";
import {
  ensureGhProductionEnvironment,
  getGhTokenScopes,
  ghSecretSetEnv,
  hasGhActionsScopes,
  isGhAuthenticated,
  refreshGhActionsScopes,
} from "./gh-secrets";
import {
  canAutomateClerk,
  canAutomateGh,
  type SetupCliContext,
} from "./setup-cli";
import { printManualAction } from "./manual-action";
import {
  CLERK_CREATE_APP,
  CONVEX_DASHBOARD,
  VERCEL_TOKENS,
  clerkAppDashboardUrl,
  githubEnvironmentsUrl,
} from "./platform-urls";
import { maskSecret, promptConfirm, promptLine, promptSecret } from "./prompt";
import {
  markProductionGithubSecretsSynced,
  type SetupConfig,
} from "./setup-config";
import { resolveVercelApiToken } from "./vercel-auth";
import { upsertVercelProjectEnv } from "./vercel-api";

export type BootstrapProductionOptions = {
  vercelToken?: string;
  cliContext?: SetupCliContext;
  /** Skip confirmation prompts; proceed when prerequisites are met. */
  autoConfirm?: boolean;
};

type ClerkProductionKeyPair = {
  publishableKey: string;
  secretKey: string;
};

/**
 * Resolves Clerk Production keys via CLI pull, deploy, or interactive paste.
 *
 * @param root - Repository root
 * @param options - Setup options including Clerk CLI context
 */
async function resolveClerkProductionKeys(
  root: string,
  options?: BootstrapProductionOptions,
): Promise<ClerkProductionKeyPair | null> {
  console.log("\nClerk production keys");

  const clerkCliReady = Boolean(
    options?.cliContext && canAutomateClerk(options.cliContext),
  );
  if (clerkCliReady) {
    const pulled = await pullClerkProductionEnv(
      options!.cliContext!.clerk,
      root,
    );
    if (pulled) {
      console.log(
        `✓ Using Clerk production keys (pk ${maskSecret(pulled.publishableKey)})`,
      );
      return pulled;
    }
  }

  printManualAction(
    "Provision Clerk Production first",
    [
      "New Clerk apps show **Development** only until you deploy Production once",
      clerkCliReady
        ? "Setup can run `bunx clerk deploy` for you on the next prompt"
        : "Run `bunx clerk auth login` and `bunx clerk deploy` from the repo root",
      "Or in the Clerk dashboard: your application → **Deploy** / **Deploy to production**",
      "After that, the API keys page lists **Production** in the instance dropdown",
    ],
    { immediate: true },
  );

  if (clerkCliReady) {
    const deployNow = options?.autoConfirm
      ? true
      : await promptConfirm(
          "Run `bunx clerk deploy` now? (interactive wizard — required before Production keys exist)",
          { defaultYes: true },
        );
    if (deployNow) {
      const pulled = await deployClerkProduction(
        options!.cliContext!.clerk,
        root,
      );
      if (pulled) {
        console.log(
          `✓ Using Clerk production keys (pk ${maskSecret(pulled.publishableKey)})`,
        );
        return pulled;
      }
    }
  } else {
    const productionReady = await promptConfirm(
      "Have you deployed Clerk to Production? (required before live keys exist)",
      { defaultYes: false },
    );
    if (!productionReady) {
      printManualAction("Deploy Clerk Production, then resume setup", [
        "Run `bunx clerk auth login` and `bunx clerk deploy` from the repo root",
        "Or use the Clerk dashboard **Deploy** action on your application",
        "Re-run `bun run setup` when the API keys page shows a Production instance",
      ]);
      return null;
    }
  }

  const linkedAppId =
    options?.cliContext && canAutomateClerk(options.cliContext)
      ? await readLinkedClerkAppId(options.cliContext.clerk, root)
      : undefined;
  const keysUrl = linkedAppId
    ? clerkAppDashboardUrl(linkedAppId)
    : CLERK_CREATE_APP;

  printManualAction(
    "Paste Clerk Production API keys",
    [
      `Open ${keysUrl} (same Clerk account as \`bunx clerk whoami\`)`,
      "Open your app → **API keys** → switch instance to **Production**",
      "Copy **Publishable key** (`pk_live_…`)",
    ],
    { immediate: true },
  );

  let publishableKey = "";
  while (
    !isClerkPublishableKey(publishableKey) ||
    !publishableKey.startsWith("pk_live_")
  ) {
    const rawPk = await promptSecret(
      `${PUBLIC_CLERK_PUBLISHABLE_KEY} (pk_live_…)`,
      {
        required: true,
        hint: "Paste pk_live_… from Production → API keys (input hidden)",
      },
    );
    publishableKey = normalizeEnvPaste(PUBLIC_CLERK_PUBLISHABLE_KEY, rawPk);
    if (!publishableKey.startsWith("pk_live_")) {
      console.log(
        "  Production releases need a live publishable key (pk_live_…).",
      );
      publishableKey = "";
    } else {
      console.log(`✓ Clerk publishable key (${maskSecret(publishableKey)})`);
    }
  }

  const clerkSkInput = normalizeEnvPaste(
    "CLERK_SECRET_KEY",
    await promptSecret("CLERK_SECRET_KEY (sk_live_…)", {
      hint: "Same Production page → Secret keys — optional (press Enter to skip)",
    }),
  );
  const secretKey = isClerkSecretKey(clerkSkInput) ? clerkSkInput : "";
  if (secretKey) {
    console.log(`✓ Clerk secret key (${maskSecret(secretKey)})`);
  }

  return { publishableKey, secretKey };
}

/**
 * Configures GitHub `production` environment secrets for `release-*` deploys.
 *
 * @param root - Repository root
 * @param setup - Persisted setup config
 * @param options - Optional Vercel token and CLI context from earlier setup steps
 */
export async function bootstrapProduction(
  root: string,
  setup: SetupConfig,
  options?: BootstrapProductionOptions,
): Promise<void> {
  const github = resolveGitHubRepo(root);
  const hasApex = hasApexDomain(setup.apexDomain);
  const hostnames = hasApex ? deriveHostnames(setup.apexDomain!) : null;
  const firstSync = !setup.github?.syncedSecrets?.production;

  if (!firstSync) {
    console.log("\nProduction (release-* tags)");
    console.log("✓ Production secrets already synced — skip");
    return;
  }

  if (!hasApex) {
    console.log("\nProduction (release-* tags)");
    console.log(
      "○ Skipped — no apex domain in setup (Clerk Production and release hostnames need a domain you own)",
    );
    console.log(
      "  Re-run setup with an apex domain before `release-*` deploys.",
    );
    return;
  }

  console.log("\nProduction (release-* tags)");
  console.log(
    "  GitHub **production** environment — prod Convex, Clerk, and Vercel build values.",
  );
  console.log(`  Convex dashboard: ${CONVEX_DASHBOARD}`);
  if (github) {
    console.log(`  GitHub environment: ${githubEnvironmentsUrl(github)}`);
  }

  const proceed = options?.autoConfirm
    ? firstSync
    : await promptConfirm("Configure production stack for release-* deploys?", {
        defaultYes: firstSync,
      });
  if (!proceed) {
    console.log("○ Skipped — docs/ci-cd.md#production-environment-secrets");
    return;
  }

  if (!github) {
    printManualAction("Add a GitHub remote", [
      "Re-run setup after adding `origin`",
    ]);
    return;
  }

  const ghReady = options?.cliContext
    ? canAutomateGh(options.cliContext)
    : await isGhAuthenticated();
  if (!ghReady) {
    printManualAction("Authenticate GitHub CLI", ["Run `gh auth login`"]);
    return;
  }

  if (!isConvexLinked(root)) {
    printManualAction("Link Convex first", [
      `Convex dashboard: ${CONVEX_DASHBOARD}`,
    ]);
    return;
  }

  if (!hasGhActionsScopes(await getGhTokenScopes(root))) {
    if (options?.autoConfirm) {
      await refreshGhActionsScopes(root);
    } else {
      const refreshScopes = await promptConfirm(
        "Grant repo + workflow scopes via `gh auth refresh`?",
        { defaultYes: true },
      );
      if (refreshScopes) {
        await refreshGhActionsScopes(root);
      }
    }
  }

  let productionEnv = await ensureGhProductionEnvironment(root, github);
  if (!productionEnv.ok && productionEnv.needsScopeRefresh) {
    if (options?.autoConfirm) {
      if (await refreshGhActionsScopes(root)) {
        productionEnv = await ensureGhProductionEnvironment(root, github);
      }
    } else {
      const refreshScopes = await promptConfirm(
        "Grant repo + workflow scopes via `gh auth refresh`?",
        { defaultYes: true },
      );
      if (refreshScopes && (await refreshGhActionsScopes(root))) {
        productionEnv = await ensureGhProductionEnvironment(root, github);
      }
    }
  }

  if (!productionEnv.ok) {
    printManualAction("Create the GitHub production environment", [
      productionEnv.message,
      `GitHub → Settings → Environments: ${githubEnvironmentsUrl(github)}`,
    ]);
    return;
  }
  console.log("✓ GitHub production environment ready");

  const clerkKeys = await resolveClerkProductionKeys(root, options);
  if (!clerkKeys) {
    return;
  }
  const { publishableKey: clerkPk, secretKey: clerkSk } = clerkKeys;

  let issuerDomain =
    (await resolveClerkIssuerDomain(clerkPk, clerkSk || undefined)) ?? "";
  if (issuerDomain) {
    console.log(`✓ Clerk production issuer: ${issuerDomain}`);
  } else {
    const issuerDefault = issuerFromPublishableKey(clerkPk);
    let rawIssuer = "";
    while (!rawIssuer) {
      rawIssuer = await promptLine(
        "Clerk Production Frontend API URL (API keys page)",
        {
          defaultValue: issuerDefault ?? undefined,
          required: !issuerDefault,
        },
      );
    }
    issuerDomain = normalizeClerkIssuerDomain(rawIssuer);
  }

  const convexIssuerSet = await setConvexEnvVar(
    root,
    "CLERK_JWT_ISSUER_DOMAIN",
    issuerDomain,
    true,
  );

  let convexUrl = "";
  const referenceConvexUrl = readConvexUrlFromRootEnv(root);
  const prodSlug = convexIssuerSet.prodDeploymentSlug;
  if (prodSlug) {
    convexUrl = convexUrlFromDeploymentSlug(prodSlug, referenceConvexUrl);
    console.log(`✓ Convex production URL → ${convexUrl}`);
  }

  if (!convexUrl) {
    printManualAction("Copy Convex Production deployment URL", [
      `Convex dashboard: ${CONVEX_DASHBOARD}`,
      "Switch to **Production** → copy https://….convex.cloud",
    ]);
    while (
      !convexUrl.startsWith("https://") ||
      !convexUrl.includes(".convex.cloud")
    ) {
      const raw = await promptLine("Production PUBLIC_CONVEX_URL", {
        required: true,
      });
      convexUrl = normalizeEnvPaste("PUBLIC_CONVEX_URL", raw);
      if (!convexUrl.includes(".convex.cloud")) {
        console.log("  Expected https://….convex.cloud");
        convexUrl = "";
      }
    }
  }

  const deployKeyResult = await mintConvexDeployKey(
    root,
    "github-prod",
    "prod",
  );
  if (!deployKeyResult) {
    printManualAction("Create a Convex Production deploy key", [
      `Convex dashboard: ${CONVEX_DASHBOARD}`,
      "Production → Settings → Deploy keys",
    ]);
    return;
  }

  const deployKey = deployKeyResult.key;
  console.log(`✓ Production deploy key ${maskSecret(deployKey)}`);

  const vercel = setup.vercel;
  let vercelToken =
    options?.vercelToken?.trim() ?? process.env.VERCEL_TOKEN?.trim() ?? "";
  if (!vercelToken) {
    const resolved = await resolveVercelApiToken(root);
    if (resolved) {
      vercelToken = resolved.token;
    }
  }
  if (!vercelToken) {
    printManualAction(
      "Vercel API token for production env vars",
      [
        `Create a classic token: ${VERCEL_TOKENS}`,
        "Paste it at the next prompt (updates Vercel Production environment variables)",
      ],
      { immediate: true },
    );
    vercelToken = await promptSecret("VERCEL_TOKEN", {
      hint: "Paste your Vercel API token (input hidden), then press Enter",
    });
  }

  if (vercel?.synced && vercelToken) {
    try {
      await upsertVercelProjectEnv(
        vercelToken,
        vercel.orgId,
        vercel.projectIdWeb,
        "PUBLIC_CONVEX_URL",
        convexUrl,
        ["production"],
      );
      await upsertVercelProjectEnv(
        vercelToken,
        vercel.orgId,
        vercel.projectIdWeb,
        "PUBLIC_CLERK_PUBLISHABLE_KEY",
        clerkPk,
        ["production"],
      );
      console.log("✓ Vercel web production env vars updated");
    } catch {
      console.log(
        "○ Could not update Vercel production env — set manually in project settings",
      );
    }
  } else if (!vercel?.synced) {
    console.log(
      "○ Skip Vercel production env — run the Vercel setup step first or set manually",
    );
  }

  if (hasApex && hostnames) {
    if (clerkSk.startsWith("sk_live_")) {
      console.log("\nClerk allowed origins (Production instance)");
      const prodOrigin = `https://${hostnames.webProduction}`;
      const result = await mergeClerkAllowedOrigins(clerkSk, [prodOrigin]);
      if (result.ok) {
        if (result.added.length > 0) {
          console.log(
            `✓ Clerk production allowed origins updated (+ ${result.added.join(", ")})`,
          );
        } else {
          console.log(
            `✓ Clerk production allowed origins already include ${prodOrigin}`,
          );
        }
      } else {
        console.log(
          `○ Could not update Clerk allowed origins via API: ${result.message}`,
        );
        printManualAction(
          "Set Clerk production allowed origins via Backend API",
          [
            "Use your **Production** instance secret key (sk_live_…)",
            `PATCH https://api.clerk.com/v1/instance with allowed_origins including ${prodOrigin}`,
          ],
        );
      }
    } else {
      printManualAction(
        "Set Clerk production allowed origins via Backend API",
        [
          "Provide sk_live_… when prompted so setup can PATCH allowed_origins automatically",
          `Required origin: https://${hostnames.webProduction}`,
        ],
      );
    }
  }

  const secrets: Array<[string, string]> = [
    ["CONVEX_DEPLOY_KEY", deployKey],
    ["PUBLIC_CONVEX_URL", convexUrl],
    ["PUBLIC_CLERK_PUBLISHABLE_KEY", clerkPk],
  ];

  if (vercel?.synced) {
    secrets.push(
      ["VERCEL_ORG_ID", vercel.orgId],
      ["VERCEL_WEB_PROJECT_ID", vercel.projectIdWeb],
      ["VERCEL_MARKETING_PROJECT_ID", vercel.projectIdMarketing],
    );
  }
  if (vercelToken) {
    secrets.push(["VERCEL_TOKEN", vercelToken]);
  }

  let okCount = 0;
  for (const [name, value] of secrets) {
    const ok = await ghSecretSetEnv(root, "production", name, value);
    console.log(
      ok ? `✓ production / ${name}` : `○ Failed production / ${name}`,
    );
    if (ok) {
      okCount += 1;
    }
  }

  if (okCount >= 3) {
    markProductionGithubSecretsSynced(root);
  }
}
