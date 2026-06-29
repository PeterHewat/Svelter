/* eslint-disable no-console -- CLI wizard */
import { clerkProductionOrigins } from "../../packages/config/hostnames";
import { hasApexDomain } from "../../packages/config/validate-domain";
import { resolveGitHubRepo } from "./apply-identity";
import { deployClerkProduction, pullClerkProductionEnv } from "./clerk-cli";
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
import { printManualAction } from "./manual-action";
import { CONVEX_DASHBOARD, githubEnvironmentsUrl } from "./platform-urls";
import { maskSecret, promptConfirm, promptLine } from "./prompt";
import { trySyncApexDnsToCloudflare } from "./cloudflare-apex-dns";
import {
  findApexCloudflareZone,
  printClerkDeferredUntilCloudflareZone,
} from "./sync-clerk-cloudflare-dns";
import {
  markProductionGithubSecretsSynced,
  type SetupConfig,
} from "./setup-config";
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
 * @param options - Setup options including Clerk CLI context
 */
async function resolveClerkProductionKeys(
  root: string,
  hasApex: boolean,
  apexDomain: string | undefined,
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
      console.log(
        `○ Clerk Production deferred — no Cloudflare zone for ${apexDomain}`,
      );
      printClerkDeferredUntilCloudflareZone(apexDomain);
      return { kind: "deferred" };
    }
  }

  if (clerkCliReady) {
    const pulled = await deployClerkProduction(
      options!.cliContext!.clerk,
      root,
      apexDomain,
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
    return { kind: "deferred" };
  }

  printManualAction("Deploy Clerk Production for your apex domain", [
    `Run \`bunx clerk auth login\` and \`bunx clerk deploy\` — use ${apexDomain} as the production domain`,
    "Or use the Clerk dashboard **Deploy** action on your application",
    "Re-run `bun run setup` when the API keys page shows a Production instance",
  ]);
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
    "Use your **Production** instance secret key (sk_live_…)",
    `PATCH https://api.clerk.com/v1/instance with allowed_origins including ${origins.join(", ")}`,
  ]);
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
      ...origins,
      "Clerk dashboard → your app → Production instance → allowed origins",
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
  const github = resolveGitHubRepo(root);
  const hasApex = hasApexDomain(setup.apexDomain);
  const firstSync = !setup.github?.syncedSecrets?.production;
  const webProject = setup.cloudflare?.projectNameWeb;

  if (!firstSync) {
    console.log("\nProduction (release-* tags)");
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
    if (hasApex) {
      await trySyncApexDnsToCloudflare(root, setup);
    }
    return "skipped";
  }

  console.log("\nProduction (release-* tags)");
  console.log(
    "→ Configuring GitHub **production** environment (Convex, Clerk, Cloudflare).",
  );
  if (hasApex) {
    console.log(
      `  Apex: ${setup.apexDomain} — Clerk deploy runs automatically.`,
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
    printManualAction("Add a GitHub remote", [
      "Re-run setup after adding `origin`",
    ]);
    return "failed";
  }

  const ghReady = options?.cliContext
    ? canAutomateGh(options.cliContext)
    : await isGhAuthenticated();
  if (!ghReady) {
    printManualAction("Authenticate GitHub CLI", ["Run `gh auth login`"]);
    return "failed";
  }

  if (!isConvexLinked(root)) {
    printManualAction("Link Convex first", [
      `Convex dashboard: ${CONVEX_DASHBOARD}`,
    ]);
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
    printManualAction("Create the GitHub production environment", [
      productionEnv.message,
      `GitHub → Settings → Environments: ${githubEnvironmentsUrl(github)}`,
    ]);
    return "failed";
  }
  console.log("✓ GitHub production environment ready");

  const clerkResolve = await resolveClerkProductionKeys(
    root,
    hasApex,
    setup.apexDomain,
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
          "Clerk Dashboard → API keys → switch to **Production**",
          "Copy the Frontend API URL (e.g. https://clerk.example.com for a custom domain)",
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
    printManualAction("Create a Convex Production deploy key", [
      `Convex dashboard: ${CONVEX_DASHBOARD}`,
      "Production → Settings → Deploy keys",
      "Or ensure `bunx convex login` is active (dev CONVEX_DEPLOY_KEY in `.env.local` blocks minting via CLI)",
    ]);
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

  const cloudflare = setup.cloudflare;
  if (!cloudflare?.synced) {
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
      clerkCli:
        options?.cliContext && canAutomateClerk(options.cliContext)
          ? options.cliContext.clerk
          : undefined,
      instance: "production",
    });
  } else if (webProject && !clerkDeferred) {
    printManualAction("Set Clerk production allowed origins via Backend API", [
      "Provide sk_live_… when prompted so setup can PATCH allowed_origins automatically",
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
    console.log(
      "○ Production partially synced — re-run `bun run setup` with an apex domain to finish Clerk and release sign-in",
    );
    return okCount >= 2 ? "partial" : "failed";
  }
  if (okCount >= 3) {
    markProductionGithubSecretsSynced(root);
    return "synced";
  }
  return "failed";
}
