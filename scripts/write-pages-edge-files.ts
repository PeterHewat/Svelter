#!/usr/bin/env bun
/* eslint-disable no-console -- CLI usage message */
/**
 * Writes Cloudflare Pages `_headers` into app build output.
 *
 * Web SPA routing uses `index.html` fallback + Cloudflare Pages built-in SPA
 * mode (no `_redirects` — `/* /200.html 200` loops on Pages).
 *
 * @example
 * bun scripts/write-pages-edge-files.ts web
 * bun scripts/write-pages-edge-files.ts marketing
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  marketingPagesHeadersFile,
  webPagesHeadersFile,
} from "../packages/config/pages-edge";

type Surface = "web" | "marketing";

const SURFACES: Record<Surface, { buildDir: string }> = {
  web: { buildDir: "apps/web/build" },
  marketing: { buildDir: "apps/marketing/build" },
};

/**
 * Writes Pages edge config files for one app surface.
 *
 * @param root - Repository root
 * @param surface - `web` or `marketing`
 */
export function writePagesEdgeFiles(root: string, surface: Surface): void {
  const spec = SURFACES[surface];
  const outDir = resolve(root, spec.buildDir);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    resolve(outDir, "_headers"),
    surface === "web" ? webPagesHeadersFile() : marketingPagesHeadersFile(),
  );
}

const surfaceArg = process.argv[2]?.trim();
if (surfaceArg !== "web" && surfaceArg !== "marketing") {
  console.error("Usage: bun scripts/write-pages-edge-files.ts <web|marketing>");
  process.exit(1);
}

const root = resolve(import.meta.dir, "..");
writePagesEdgeFiles(root, surfaceArg);
