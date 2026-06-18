#!/usr/bin/env bun
/**
 * Post-processes the marketing SSG build for lean Cloudflare Pages deploys.
 *
 * @example
 * bun scripts/optimize-marketing-build.ts
 */
import { resolve } from "node:path";
import { optimizeMarketingBuild } from "./lib/optimize-marketing-build";

const buildDir = resolve(import.meta.dir, "../apps/marketing/build");
optimizeMarketingBuild(buildDir);
