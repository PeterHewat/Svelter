/* eslint-disable no-console -- CLI wizard */
import { clerkProductionOrigins } from "../../packages/config/hostnames";
import { hasApexDomain } from "../../packages/config/validate-domain";
import { resolveGitHubRepo } from "./apply-identity";
import {
  deployClerkProduction,
  finishClerkProductionDeployViaAgentStatus,
  pullClerkProductionEnv,
} from "./clerk-cli";
import { syncClerkGoogleOAuth } from "./clerk-google-oauth";
import {
  issuerFromPublishableKey,
  mergeClerkAllowedOrigins,
  normalizeClerkIssuerDomain,
  resolveClerkIssuerDomain,
} from "./clerk-instance";
import { mintConvexDeployKey } from "./convex-deploy-key";
import { getConvexEnvVar, setConvexEnvVar } from "./convex-env";
import { syncAnonymousAuthEnv } from "./sync-anon-auth";
import {
  convexUrlFromDeploymentSlug,
  readConvexUrlFromRootEnv,
  resolveProdConvexUrl,
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
import { printManualAction, requireManualAction } from "./manual-action";
import {
  CONVEX_DASHBOARD,
  CLERK_API_KEYS,
  githubEnvironmentsUrl,
} from "./platform-urls";
import { maskSecret, promptConfirm, promptLine } from "./prompt";
import { trySyncApexDnsToCloudflare } from "./cloudflare-apex-dns";
import { findApexCloudflareZone } from "./sync-clerk-cloudflare-dns";
import {
  markProductionGithubSecretsSynced,
  readSetupConfig,
  type SetupConfig,
} from "./setup-config";
import { cloudflareProductionBlockedDnsSteps } from "./cloudflare-manual-steps";
import { logSetupStackSection } from "./setup-stack-labels";
export type BootstrapProductionOptions = {
  cliContext?: SetupCliContext;
  /** Skip confirmation prompts; proceed when prerequisites are met. */
  autoConfirm?: boolean;
};

type ClerkProductionKeyPair = {
  publishableKey: string;
  secretKey: string;
};

export type ClerkProductionResolve =
  { kind: "ready"; keys: ClerkProductionKeyPair } | { kind: "deferred" };

export type BootstrapProductionResult =
  "synced" | "partial" | "skipped" | "failed";

/**
 * Resolves Clerk Production keys via CLI pull or deploy when an apex domain is set.
 *
 * @param root - Repository root
 * @param hasApex - Whether setup has a Cloudflare hosting apex
 * @param apexDomain - Apex domain for Clerk Production when set
 * @param productName - Product name from setup config
 * @param options - Setup options including Clerk CLI context
 */
async function resolveClerkProductionKeys(
  root: string,
  hasApex: boolean,
  apexDomain: string | undefined,
  productName: string,
  options?: BootstrapProductionOptions,
): Promise<ClerkProductionResolve> {
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
      return { kind: "ready", keys: pulled };
    }
  }

  if (!hasApex) {
    console.log(
      "○ Clerk Production deferred — no apex domain (Clerk requires a domain you own, not `*.pages.dev`)",
    );
    return { kind: "deferred" };
  }

  if (apexDomain) {
    const zone = await findApexCloudflareZone(root, apexDomain);
    if (!zone) {
      requireManualAction(
        `Create the Cloudflare zone before Clerk production deploy`,
        [
          `Dashboard → Domains → Add a domain → ${apexDomain} (Free plan)`,
          "Clerk DNS records belong in Cloudflare DNS — not as individual CNAMEs at your registrar",
          "After `clerk deploy`, setup syncs Clerk DNS from the Backend API (BIND file fallback in `.svelter/`)",
          "Then point registrar nameservers at Cloudflare — setup prints generic registrar steps",
          "Re-run `bun run setup` when the zone exists",
        ],
        options,
      );
    }
  }

  if (clerkCliReady && apexDomain) {
    const resumed = await finishClerkProductionDeployViaAgentStatus(
      options!.cliContext!.clerk,
      root,
      apexDomain,
      { wait: true },
    );
    if (resumed) {
      const pulledAfterResume = await pullClerkProductionEnv(
        options!.cliContext!.clerk,
        root,
      );
      if (pulledAfterResume) {
        console.log(
          `✓ Using Clerk production keys (pk ${maskSecret(pulledAfterResume.publishableKey)})`,
        );
        return { kind: "ready", keys: pulledAfterResume };
      }
    }
  }

  if (clerkCliReady) {
    const pulled = await deployClerkProduction(
      options!.cliContext!.clerk,
      root,
      apexDomain,
      productName,
    );
    if (pulled) {
      console.log(
        `✓ Using Clerk production keys (pk ${maskSecret(pulled.publishableKey)})`,
      );
      return { kind: "ready", keys: pulled };
    }
    console.log(
      "○ Clerk Production incomplete — finish `clerk deploy` or the dashboard, then re-run setup",
    );
    requireManualAction(
      "Complete Clerk Production deploy",
      [
        apexDomain
          ? `Run \`bunx clerk deploy\` — use ${apexDomain} as the production domain`
          : "Run `bunx clerk deploy` or use Clerk dashboard → Deploy to production",
        "Re-run `bun run setup` when Production keys (pk_live_ / sk_live_) are available",
      ],
      options,
    );
  }

  requireManualAction(
    "Deploy Clerk Production for your apex domain",
    [
      `Run \`bunx clerk auth login\` and \`bunx clerk deploy\` — use ${apexDomain} as the production domain`,
      "Or use the Clerk dashboard **Deploy** action on your application",
      "Re-run `bun run setup` when the API keys page shows a Production instance",
    ],
    options,
  );
  return { kind: "deferred" };
}

/**
 * Merges Clerk Production allowed origins for pages.dev and optional apex web.
 */
async function syncClerkProductionAllowedOrigins(
  setup: SetupConfig,
  webProject: string,
  clerkSk: string,
): Promise<void> {
  const origins = clerkProductionOrigins(
    webProject,
    hasApexDomain(setup.apexDomain) ? setup.apexDomain : undefined,
  );
  console.log("\nClerk allowed origins (Production instance)");
  const result = await mergeClerkAllowedOrigins(clerkSk, origins);
  if (result.ok) {
    if (result.added.length > 0) {
      console.log(
        `✓ Clerk production allowed origins updated (+ ${result.added.join(", ")})`,
      );
    } else {
      console.log(
        `✓ Clerk production allowed origins already include ${origins.join(", ")}`,
      );
    }
    return;
  }
  console.log(
    `○ Could not update Clerk allowed origins via API: ${result.message}`,
  );
  printManualAction("Set Clerk production allowed origins via Backend API", [
    "Use your **Production** instance secret key (`sk_live_…`)",
    "PATCH https://api.clerk.com/v1/instance",
    "Header: Authorization: Bearer <CLERK_SECRET_KEY (sk_live_…)>",
    `Body: include allowed_origins: ${origins.join(", ")}`,
  ]);
}

/**
 * Best-effort Production Google OAuth sync when production bootstrap is skipped on resume.
 */
async function trySyncClerkGoogleOAuthOnResume(
  root: string,
  setup: SetupConfig,
  options?: BootstrapProductionOptions,
): Promise<void> {
  if (!hasApexDomain(setup.apexDomain)) {
    return;
  }
  let clerkSk = "";
  let clerkPk = "";
  if (options?.cliContext && canAutomateClerk(options.cliContext)) {
    const pulled = await pullClerkProductionEnv(options.cliContext.clerk, root);
    clerkSk = pulled?.secretKey ?? "";
    clerkPk = pulled?.publishableKey ?? "";
  }
  if (!clerkSk.startsWith("sk_live_")) {
    return;
  }
  const productionIssuer =
    (await resolveClerkIssuerDomain(clerkPk, clerkSk)) ??
    issuerFromPublishableKey(clerkPk);
  await syncClerkGoogleOAuth(root, setup, {
    issuerDomain: productionIssuer,
    secretKey: clerkSk,
    interactive: !options?.autoConfirm,
    autoConfirm: options?.autoConfirm,
    clerkCli:
      options?.cliContext && canAutomateClerk(options.cliContext)
        ? options.cliContext.clerk
        : undefined,
    instance: "production",
  });
}

/**
 * Best-effort Production origin sync when GitHub secrets are already synced (e.g. apex added later).
 */
async function trySyncClerkProductionOriginsOnResume(
  root: string,
  setup: SetupConfig,
  options?: BootstrapProductionOptions,
): Promise<void> {
  const webProject = setup.cloudflare?.projectNameWeb;
  if (!webProject) {
    return;
  }
  let clerkSk = "";
  if (options?.cliContext && canAutomateClerk(options.cliContext)) {
    const pulled = await pullClerkProductionEnv(options.cliContext.clerk, root);
    clerkSk = pulled?.secretKey ?? "";
  }
  if (!clerkSk.startsWith("sk_live_")) {
    console.log(
      "○ Clerk production origins — run `bunx clerk env pull` (Production) or paste sk_live_ on next full Production setup",
    );
    const origins = clerkProductionOrigins(
      webProject,
      hasApexDomain(setup.apexDomain) ? setup.apexDomain : undefined,
    );
    printManualAction("Ensure Clerk Production allowed origins include", [
      `Open Clerk Dashboard → switch to **Production** (instance switcher, top bar)`,
      "Configure → **Domains** → **Allowed origins** → add each:",
      ...origins.map((origin) => `  • ${origin}`),
    ]);
    return;
  }
  await syncClerkProductionAllowedOrigins(setup, webProject, clerkSk);
}

/**
 * Configures GitHub `production` environment secrets for `release-*` deploys.
 *
 * @param root - Repository root
 * @param setup - Persisted setup config
 * @param options - Optional CLI context from earlier setup steps
 */
export async function bootstrapProduction(
  root: string,
  setup: SetupConfig,
  options?: BootstrapProductionOptions,
): Promise<BootstrapProductionResult> {
  setup = readSetupConfig(root) ?? setup;
  const github = resolveGitHubRepo(root);
  const hasApex = hasApexDomain(setup.apexDomain);
  const firstSync = !setup.github?.syncedSecrets?.production;
  const webProject = setup.cloudflare?.projectNameWeb;

  if (!firstSync) {
    logSetupStackSection(
      "production",
      "Production (release-* tags)",
      "Skip — GitHub production environment secrets already synced",
    );
    console.log("✓ Production GitHub secrets already synced — skip");
    const prodAnonIssuer = await getConvexEnvVar(
      root,
      "ANON_AUTH_ISSUER",
      true,
    );
    if (!prodAnonIssuer) {
      console.log(
        "○ Production anonymous auth (ANON_AUTH_*) not set — clear `github.syncedSecrets.production` in .svelter/setup.json and re-run setup, or set vars on Convex Production",
      );
    }
    await trySyncClerkProductionOriginsOnResume(root, setup, options);
    await trySyncClerkGoogleOAuthOnResume(root, setup, options);
    if (hasApex) {
      await trySyncApexDnsToCloudflare(root, setup);
    }
    return "skipped";
  }

  logSetupStackSection(
    "production",
    "Production (release-* tags)",
    "GitHub `production` environment — Convex prod · Clerk Production (pk_live_) · release Pages deploy",
  );
  if (hasApex) {
    console.log(
      `  Apex: ${setup.apexDomain} — Clerk Production deploy runs in this step (not Development).`,
    );
  } else {
    console.log(
      "  No apex — Clerk deferred; Convex + Cloudflare sync to `{slug}-*.pages.dev`.",
    );
  }
  console.log(`  Convex dashboard: ${CONVEX_DASHBOARD}`);
  if (github) {
    console.log(`  GitHub environment: ${githubEnvironmentsUrl(github)}`);
  }

  if (!github) {
    requireManualAction(
      "Add a GitHub remote",
      ["Re-run setup after adding `origin`"],
      options,
    );
    return "failed";
  }

  const ghReady = options?.cliContext
    ? canAutomateGh(options.cliContext)
    : await isGhAuthenticated();
  if (!ghReady) {
    requireManualAction(
      "Authenticate GitHub CLI",
      ["Run `gh auth login`"],
      options,
    );
    return "failed";
  }

  if (!isConvexLinked(root)) {
    requireManualAction(
      "Link Convex first",
      [`Convex dashboard: ${CONVEX_DASHBOARD}`],
      options,
    );
    return "failed";
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
    requireManualAction(
      "Create the GitHub production environment",
      [
        productionEnv.message,
        `GitHub → Settings → Environments: ${githubEnvironmentsUrl(github)}`,
      ],
      options,
    );
    return "failed";
  }
  console.log("✓ GitHub production environment ready");

  if (hasApex && !setup.cloudflare?.synced) {
    requireManualAction(
      "Complete Cloudflare Pages setup first",
      [
        "Finish the Cloudflare Pages step (projects, zone, DNS) before production secrets",
        "Re-run `bun run setup` and confirm Cloudflare setup",
      ],
      options,
    );
  }

  if (hasApex && setup.cloudflare?.synced && !setup.cloudflare.dnsConfigured) {
    requireManualAction(
      "Finish the Cloudflare Pages step before production",
      cloudflareProductionBlockedDnsSteps(setup.apexDomain!),
      options,
    );
  }

  const clerkResolve = await resolveClerkProductionKeys(
    root,
    hasApex,
    setup.apexDomain,
    setup.productName,
    options,
  );
  const clerkDeferred = clerkResolve.kind === "deferred";
  const clerkPk =
    clerkResolve.kind === "ready" ? clerkResolve.keys.publishableKey : "";
  const clerkSk =
    clerkResolve.kind === "ready" ? clerkResolve.keys.secretKey : "";

  let convexUrl = "";
  const referenceConvexUrl = readConvexUrlFromRootEnv(root);

  if (!clerkDeferred) {
    let issuerDomain =
      (await resolveClerkIssuerDomain(clerkPk, clerkSk || undefined)) ?? "";
    if (!issuerDomain) {
      const fromKey = issuerFromPublishableKey(clerkPk);
      if (fromKey) {
        issuerDomain = fromKey;
      }
    }
    if (issuerDomain) {
      console.log(`✓ Clerk production issuer: ${issuerDomain}`);
    } else {
      const apexHint = hasApexDomain(setup.apexDomain)
        ? `https://clerk.${setup.apexDomain}`
        : undefined;
      printManualAction(
        "Clerk Production Frontend API URL",
        [
          `Open ${CLERK_API_KEYS} — switch to **Production** (instance switcher, top bar)`,
          "Copy **Frontend API URL** (e.g. `https://clerk.example.com` for a custom domain)",
          apexHint ? `Expected for your apex: ${apexHint}` : "",
        ].filter(Boolean),
      );
      let rawIssuer = "";
      while (!rawIssuer) {
        rawIssuer = await promptLine(
          "Clerk Production Frontend API URL (API keys page)",
          {
            defaultValue: apexHint,
            required: true,
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
    const prodSlug = convexIssuerSet.prodDeploymentSlug;
    if (prodSlug) {
      convexUrl = convexUrlFromDeploymentSlug(prodSlug, referenceConvexUrl);
      console.log(`✓ Convex production URL → ${convexUrl}`);
    }
  } else {
    console.log(
      "\n○ Skip Clerk on Convex prod — re-run setup with an apex domain when ready",
    );
  }

  const deployKeyResult = await mintConvexDeployKey(
    root,
    "github-prod",
    "prod",
  );
  if (!deployKeyResult) {
    requireManualAction(
      "Create a Convex Production deploy key",
      [
        `Convex dashboard: ${CONVEX_DASHBOARD}`,
        "Production → Settings → Deploy keys",
        "Or ensure `bunx convex login` is active (dev CONVEX_DEPLOY_KEY in `.env.local` blocks minting via CLI)",
      ],
      options,
    );
    return "failed";
  }

  const deployKey = deployKeyResult.key;
  console.log(`✓ Production deploy key ${maskSecret(deployKey)}`);

  if (!convexUrl) {
    const resolved = resolveProdConvexUrl(
      deployKey,
      undefined,
      referenceConvexUrl,
    );
    if (resolved) {
      convexUrl = resolved;
      console.log(`✓ Convex production URL → ${convexUrl}`);
    }
  }

  if (!convexUrl) {
    printManualAction("Copy Convex Production deployment URL", [
      `Open ${CONVEX_DASHBOARD}`,
      "Switch deployment to **Production** (top bar)",
      "Go to **Settings** → copy the deployment URL (`https://….convex.cloud`)",
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

  const cloudflare = setup.cloudflare;
  if (!cloudflare?.synced && !hasApex) {
    console.log(
      "○ Cloudflare Pages secrets sync in the Cloudflare step — complete that first",
    );
  }

  if (convexUrl) {
    await syncAnonymousAuthEnv(root, { prod: true, convexCloudUrl: convexUrl });
  }

  if (clerkSk.startsWith("sk_live_") && webProject) {
    if (hasApex && setup.apexDomain) {
      await trySyncApexDnsToCloudflare(root, setup);
    }
    await syncClerkProductionAllowedOrigins(setup, webProject, clerkSk);
    const productionIssuer =
      (await resolveClerkIssuerDomain(clerkPk, clerkSk)) ??
      issuerFromPublishableKey(clerkPk);
    await syncClerkGoogleOAuth(root, setup, {
      issuerDomain: productionIssuer,
      secretKey: clerkSk,
      interactive: !options?.autoConfirm,
      autoConfirm: options?.autoConfirm,
      clerkCli:
        options?.cliContext && canAutomateClerk(options.cliContext)
          ? options.cliContext.clerk
          : undefined,
      instance: "production",
    });
  } else if (webProject && !clerkDeferred) {
    printManualAction("Set Clerk production allowed origins via Backend API", [
      "Paste `sk_live_…` when prompted so setup can PATCH allowed_origins automatically",
      `Required origins: ${clerkProductionOrigins(webProject, hasApex ? setup.apexDomain : undefined).join(", ")}`,
    ]);
  }

  const secrets: Array<[string, string]> = [
    ["CONVEX_DEPLOY_KEY", deployKey],
    ["PUBLIC_CONVEX_URL", convexUrl],
  ];
  if (!clerkDeferred && clerkPk) {
    secrets.push(["PUBLIC_CLERK_PUBLISHABLE_KEY", clerkPk]);
  }

  let okCount = 0;
  for (const [name, value] of secrets) {
    if (!value.trim()) {
      console.log(`○ Skip production / ${name} — no value yet`);
      continue;
    }
    const ok = await ghSecretSetEnv(root, "production", name, value);
    console.log(
      ok ? `✓ production / ${name}` : `○ Failed production / ${name}`,
    );
    if (ok) {
      okCount += 1;
    }
  }

  if (clerkDeferred) {
    if (hasApex) {
      requireManualAction(
        "Complete Clerk Production before release deploys",
        [
          setup.apexDomain
            ? `Deploy Clerk Production for ${setup.apexDomain} (\`bunx clerk deploy\` or dashboard)`
            : "Deploy Clerk Production via `bunx clerk deploy` or the Clerk dashboard",
          "Re-run `bun run setup` when pk_live_ / sk_live_ keys are available",
        ],
        options,
      );
    }
    console.log(
      "○ Production partially synced — no apex domain; Clerk deferred until you add one",
    );
    return okCount >= 2 ? "partial" : "failed";
  }
  if (okCount >= 3) {
    markProductionGithubSecretsSynced(root);
    return "synced";
  }
  return "failed";
}
