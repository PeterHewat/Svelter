import { defineConfig } from "vitest/config";
import {
  createRepoAliases,
  dedupeWebVite,
  utilsAliasKeys,
} from "../config/aliases";

/** Integration tests only — do not merge with vitest.config (merged globs exclude all files). */
export default defineConfig({
  test: {
    environment: "happy-dom",
    execArgv: ["--disable-warning=ExperimentalWarning"],
    globals: true,
    setupFiles: ["./setupTests.ts"],
    include: ["src/**/*.integration.test.ts"],
    exclude: ["**/dist/**", "**/node_modules/**"],
  },
  resolve: {
    alias: createRepoAliases(utilsAliasKeys),
    dedupe: [...dedupeWebVite],
  },
});
