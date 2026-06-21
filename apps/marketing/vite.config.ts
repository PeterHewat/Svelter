import { execSync } from "node:child_process";
import {
  createRepoAliases,
  dedupeWebVite,
  marketingAliasKeys,
} from "@repo/config/aliases";
import {
  bakedApexMarketingOrigin,
  bakedApexProductOrigin,
} from "@repo/config/validate-domain";
import {
  MARKETING_DEV_PORT,
  MARKETING_PREVIEW_PORT,
} from "@repo/config/dev-ports";
import { resolveGithubRepoUrl } from "@repo/config/github-repo";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

function readGitRemoteUrl(): string | undefined {
  try {
    return execSync("git remote get-url origin", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
}

const githubRepoUrl = resolveGithubRepoUrl({
  publicGithubRepoUrl: process.env.PUBLIC_GITHUB_REPO_URL,
  githubRepository: process.env.GITHUB_REPOSITORY,
  gitRemoteUrl: readGitRemoteUrl(),
});

const apexDomain = process.env.APEX_DOMAIN?.trim() || null;

export default defineConfig({
  envPrefix: ["PUBLIC_"],
  define: {
    __GITHUB_REPO_URL__: JSON.stringify(githubRepoUrl),
    __BAKED_PRODUCT_APP_ORIGIN__: JSON.stringify(
      bakedApexProductOrigin(apexDomain),
    ),
    __BAKED_MARKETING_SITE_ORIGIN__: JSON.stringify(
      bakedApexMarketingOrigin(apexDomain),
    ),
  },
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    alias: createRepoAliases([...marketingAliasKeys]),
    dedupe: [...dedupeWebVite],
  },
  server: {
    port: MARKETING_DEV_PORT,
    fs: {
      allow: ["../.."],
    },
  },
  preview: {
    port: MARKETING_PREVIEW_PORT,
  },
});
