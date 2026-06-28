#!/usr/bin/env bun
/**
 * Bundles marketing init source modules into a single static/init.js for production.
 *
 * @example
 * bun apps/marketing/scripts/bundle-init.ts
 */
import { buildSync } from "esbuild";
import { resolve } from "node:path";

const marketingDir = resolve(import.meta.dir, "..");
const entry = resolve(marketingDir, "src/init/main.js");
const outfile = resolve(marketingDir, "static/init.js");

buildSync({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: "iife",
  target: "es2018",
  legalComments: "none",
  banner: {
    js: "/** Bundled from src/init/ — edit modules there, then run `bun run build:init`. */",
  },
});
