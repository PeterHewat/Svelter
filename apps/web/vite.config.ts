import {
  createRepoAliases,
  dedupeWebVite,
  webAliasKeys,
} from "@repo/config/aliases";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: ["PUBLIC_"],
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    alias: createRepoAliases([...webAliasKeys]),
    dedupe: [...dedupeWebVite],
  },
  server: {
    fs: {
      allow: ["../.."],
    },
  },
});
