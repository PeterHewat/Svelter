import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT_ENV = ".env.local";

/**
 * Runs a Convex CLI command that requires dashboard login (not `CONVEX_DEPLOY_KEY`).
 *
 * Temporarily removes `CONVEX_DEPLOY_KEY` from root `.env.local` so `convex deployment
 * token create` and `convex env set --prod` use the personal access token from `convex login`.
 *
 * @param root - Repository root
 * @param fn - Async callback that spawns Convex CLI
 */
export async function withConvexUserAuth<T>(
  root: string,
  fn: () => Promise<T>,
): Promise<T> {
  const abs = resolve(root, ROOT_ENV);
  if (!existsSync(abs)) {
    return fn();
  }

  const raw = readFileSync(abs, "utf8");
  const lines = raw.split("\n");
  const kept: string[] = [];
  const removed: string[] = [];
  for (const line of lines) {
    if (/^CONVEX_DEPLOY_KEY=/.test(line)) {
      removed.push(line);
    } else {
      kept.push(line);
    }
  }

  if (removed.length === 0) {
    return fn();
  }

  writeFileSync(abs, `${kept.join("\n").replace(/\n?$/, "\n")}`);
  try {
    return await fn();
  } finally {
    const current = readFileSync(abs, "utf8");
    writeFileSync(
      abs,
      `${current.replace(/\n?$/, "\n")}${removed.join("\n")}\n`,
    );
  }
}
