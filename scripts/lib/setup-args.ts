/** CLI flags for `bun scripts/setup.ts`. */
export type SetupFlags = {
  /** Non-interactive GitHub/Vercel/production sync when prerequisites are met. */
  syncSecrets: boolean;
};

/** Options passed to post-readiness bootstrap steps. */
export type SetupBootstrapOptions = {
  /** Skip confirmation prompts; proceed when CLIs and env are ready. */
  autoConfirm?: boolean;
};

/**
 * Parses setup script argv.
 *
 * @param argv - Process argv (defaults to `process.argv`)
 */
export function parseSetupFlags(argv: string[] = process.argv): SetupFlags {
  return { syncSecrets: argv.includes("--sync-secrets") };
}
