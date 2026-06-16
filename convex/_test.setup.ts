/// <reference types="vite/client" />

/**
 * Convex function modules for convex-test (excludes tests and _generated).
 * Leading `_` keeps this file out of the Convex deploy bundle.
 */
export const modules = import.meta.glob([
  "./schema.ts",
  "./http.ts",
  "./tasks.ts",
  "./_generated/**/*.js",
]);
