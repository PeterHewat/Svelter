import {
  createRepoAliases,
  dedupeWebVite,
  webAliasKeys,
} from "@repo/config/aliases";
import { WEB_DEV_PORT, WEB_PREVIEW_PORT } from "@repo/config/dev-ports";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  envPrefix: ["PUBLIC_"],
  plugins: [
    tailwindcss(),
    sveltekit(),
    mode === "analyze" &&
      visualizer({
        filename: "build-stats.html",
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
  ].filter((plugin) => plugin !== false),
  resolve: {
    alias: createRepoAliases([...webAliasKeys]),
    dedupe: [...dedupeWebVite],
  },
  server: {
    port: WEB_DEV_PORT,
    fs: {
      allow: ["../.."],
    },
  },
  preview: {
    port: WEB_PREVIEW_PORT,
  },
}));
