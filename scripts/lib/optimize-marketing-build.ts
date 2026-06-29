import { transformSync } from "esbuild";
import {
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { stripSvelteSsrMarkers } from "./optimize-marketing-html";

const CLIENT_JS_PATHS = [
  "_app/immutable/chunks",
  "_app/immutable/entry",
  "_app/immutable/nodes",
  "_app/version.json",
] as const;

/**
 * Drops prerender artifacts for hash URLs (e.g. `legal#privacy.html`).
 * Same-page anchors are served from the base page; fragment files duplicate HTML.
 *
 * @param dir - Directory to scan recursively
 */
export function removeHashFragmentHtmlArtifacts(dir: string): void {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) {
    return;
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      removeHashFragmentHtmlArtifacts(path);
      continue;
    }
    if (
      entry.isFile() &&
      entry.name.includes("#") &&
      entry.name.endsWith(".html")
    ) {
      unlinkSync(path);
    }
  }
}

/**
 * Minifies `init.js` in the marketing build output.
 *
 * @param initPath - Absolute path to `build/init.js`
 */
export function minifyMarketingInitJs(initPath: string): void {
  const source = readFileSync(initPath, "utf8");
  const { code } = transformSync(source, {
    minify: true,
    target: "es2018",
  });
  writeFileSync(initPath, code);
}

/**
 * Post-processes the marketing SSG build: strip unused client JS, minify init.js,
 * and remove SSR markers from HTML pages.
 *
 * @param buildDir - Absolute path to `apps/marketing/build`
 */
export function optimizeMarketingBuild(buildDir: string): void {
  for (const rel of CLIENT_JS_PATHS) {
    rmSync(resolve(buildDir, rel), { recursive: true, force: true });
  }

  const initPath = resolve(buildDir, "init.js");
  if (statSync(initPath, { throwIfNoEntry: false })?.isFile()) {
    minifyMarketingInitJs(initPath);
  }

  removeHashFragmentHtmlArtifacts(buildDir);

  for (const entry of readdirSync(buildDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const htmlPath = resolve(buildDir, entry.name);
    const html = readFileSync(htmlPath, "utf8");
    writeFileSync(htmlPath, stripSvelteSsrMarkers(html));
  }

  optimizeMarketingHtmlTree(resolve(buildDir, "blog"));
  for (const locale of readdirSync(buildDir, { withFileTypes: true })) {
    if (
      !locale.isDirectory() ||
      locale.name === "_app" ||
      locale.name === "blog"
    ) {
      continue;
    }
    optimizeMarketingHtmlTree(resolve(buildDir, locale.name));
  }
}

function optimizeMarketingHtmlTree(dir: string): void {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      optimizeMarketingHtmlTree(path);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const html = readFileSync(path, "utf8");
    writeFileSync(path, stripSvelteSsrMarkers(html));
  }
}
