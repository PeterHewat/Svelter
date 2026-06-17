/** Whether the current OS is macOS (for Homebrew install hints). */
export function isMacOs(): boolean {
  return process.platform === "darwin";
}

/**
 * Install hint for the global GitHub CLI.
 */
export function ghInstallHint(): string {
  if (isMacOs()) {
    return "macOS: `brew install gh` — other platforms: https://cli.github.com/manual/gh_installation";
  }
  return "https://cli.github.com/manual/gh_installation";
}

/**
 * Install hint for a repo-pinned CLI invoked via `bunx`.
 *
 * @param packageName - npm package / binary name
 * @param docsUrl - Official docs URL
 */
export function bunWorkspaceCliInstallHint(
  packageName: string,
  docsUrl: string,
): string {
  return `Run \`bun install\` at the repo root (devDependency \`${packageName}\`) — ${docsUrl}`;
}

/**
 * Install hint when a global binary is missing.
 *
 * @param tool - Short tool label
 * @param macBrewFormula - Homebrew formula when on macOS
 * @param docsUrl - Fallback docs URL
 */
export function globalCliInstallHint(
  tool: string,
  macBrewFormula: string,
  docsUrl: string,
): string {
  if (isMacOs()) {
    return `${tool}: \`brew install ${macBrewFormula}\` — ${docsUrl}`;
  }
  return `${tool}: ${docsUrl}`;
}
