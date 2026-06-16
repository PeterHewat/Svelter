import { createRepoAliases, uiSvelteAliasKeys } from "@repo/config/aliases";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte({ compilerOptions: { runes: true } })],
  resolve: {
    alias: createRepoAliases([...uiSvelteAliasKeys]),
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./setupTests.ts"],
    include: ["src/**/*.test.ts"],
  },
});
