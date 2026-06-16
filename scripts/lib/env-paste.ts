/**
 * Strips a `KEY=value` paste when the user copied a full dotenv line from a dashboard.
 *
 * @param key - Expected env var name (e.g. `PUBLIC_CONVEX_URL`)
 * @param pasted - Raw pasted string
 */
export function normalizeEnvPaste(key: string, pasted: string): string {
  const trimmed = pasted.trim();
  const prefix = `${key}=`;
  if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
    return trimmed.slice(prefix.length).trim();
  }
  return trimmed;
}
