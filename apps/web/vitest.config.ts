import { createRepoAliases, webAliasKeys } from "@repo/config/aliases";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: createRepoAliases([...webAliasKeys]),
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts", "tests/helpers/**/*.test.ts"],
  },
});
