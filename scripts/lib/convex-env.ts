/* eslint-disable no-console -- CLI wizard */
import { parseConvexProdDeploymentSlug } from "./convex-url";
import { withConvexUserAuth } from "./convex-user-auth";
import { CONVEX_DASHBOARD } from "./platform-urls";
import { readSpawnPipe } from "./spawn-io";

export type SetConvexEnvResult = {
  ok: boolean;
  prodDeploymentSlug?: string;
};

/**
 * Sets a Convex deployment environment variable via the CLI.
 *
 * Values are passed on stdin (not argv) so secrets and PEM keys with spaces
 * are not echoed to the shell or setup logs.
 *
 * @param root - Repository root
 * @param name - Variable name
 * @param value - Variable value
 * @param prod - When true, targets the production deployment
 */
export async function setConvexEnvVar(
  root: string,
  name: string,
  value: string,
  prod = false,
): Promise<SetConvexEnvResult> {
  const args = ["bunx", "convex", "env", "set", name];
  if (prod) {
    args.push("--prod");
  }
  console.log(
    `\n→ bunx convex env set ${name}${prod ? " --prod" : ""} (via stdin)`,
  );
  const run = async () => {
    const proc = Bun.spawn(args, {
      cwd: root,
      stdin: new Blob([value]),
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, CONVEX_DEPLOY_KEY: undefined },
    });
    const [stdout, stderr, code] = await Promise.all([
      readSpawnPipe(proc.stdout),
      readSpawnPipe(proc.stderr),
      proc.exited,
    ]);
    return { stdout, stderr, code };
  };

  const { stdout, stderr, code } = prod
    ? await withConvexUserAuth(root, run)
    : await run();
  const combined = `${stdout}\n${stderr}`.trim();
  if (combined) {
    for (const line of combined.split("\n")) {
      console.log(line);
    }
  }
  if (code === 0) {
    return {
      ok: true,
      prodDeploymentSlug: prod
        ? (parseConvexProdDeploymentSlug(combined) ?? undefined)
        : undefined,
    };
  }
  console.warn(`○ Could not set ${name} via CLI — use Convex dashboard`);
  console.log(
    `  ${CONVEX_DASHBOARD} → ${prod ? "Production" : "Development"} → Settings → Environment variables`,
  );
  return { ok: false };
}

/**
 * Reads a Convex deployment environment variable via the CLI.
 *
 * @param root - Repository root
 * @param name - Variable name
 * @param prod - When true, targets the production deployment
 */
export async function getConvexEnvVar(
  root: string,
  name: string,
  prod = false,
): Promise<string | null> {
  const args = ["bunx", "convex", "env", "get", name];
  if (prod) {
    args.push("--prod");
  }
  const run = async (): Promise<string | null> => {
    const proc = Bun.spawn(args, {
      cwd: root,
      stdout: "pipe",
      stderr: "ignore",
    });
    if ((await proc.exited) !== 0) {
      return null;
    }
    const text = await readSpawnPipe(proc.stdout);
    return text || null;
  };
  return prod ? withConvexUserAuth(root, run) : run();
}
