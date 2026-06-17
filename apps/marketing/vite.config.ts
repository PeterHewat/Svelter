import {
  createRepoAliases,
  dedupeWebVite,
  marketingAliasKeys,
} from "@repo/config/aliases";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    alias: createRepoAliases([...marketingAliasKeys]),
    dedupe: [...dedupeWebVite],
  },
  server: {
    fs: {
      allow: ["../.."],
    },
  },
});
