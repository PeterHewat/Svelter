#!/usr/bin/env bun
/* eslint-disable no-console -- CLI usage message */
/**
 * Writes Cloudflare Pages `_headers` and (web only) `_redirects` into app build output.
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
  webSpaRedirectsFile,
} from "../packages/config/pages-edge";

type Surface = "web" | "marketing";

const SURFACES: Record<Surface, { buildDir: string; spa: boolean }> = {
  web: { buildDir: "apps/web/build", spa: true },
  marketing: { buildDir: "apps/marketing/build", spa: false },
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
  if (spec.spa) {
    writeFileSync(resolve(outDir, "_redirects"), webSpaRedirectsFile());
  }
}

const surfaceArg = process.argv[2]?.trim();
if (surfaceArg !== "web" && surfaceArg !== "marketing") {
  console.error("Usage: bun scripts/write-pages-edge-files.ts <web|marketing>");
  process.exit(1);
}

const root = resolve(import.meta.dir, "..");
writePagesEdgeFiles(root, surfaceArg);
