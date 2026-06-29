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
import { buildSync } from "esbuild";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

function bundleMarketingInit(): void {
  buildSync({
    entryPoints: [resolve("src/init/main.ts")],
    outfile: resolve("static/init.js"),
    bundle: true,
    format: "iife",
    target: "es2018",
    legalComments: "none",
    banner: {
      js: "/** Bundled from src/init/ — edit modules there, then run `bun run build:init`. */",
    },
  });
}

function marketingInitPlugin(): Plugin {
  const initGlob = /[/\\]src[/\\]init[/\\]/;
  return {
    name: "marketing-init",
    buildStart() {
      bundleMarketingInit();
    },
    configureServer(server) {
      server.watcher.add("src/init");
      server.watcher.on("change", (file) => {
        if (initGlob.test(file)) {
          bundleMarketingInit();
        }
      });
    },
  };
}

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
  plugins: [marketingInitPlugin(), tailwindcss(), sveltekit()],
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
