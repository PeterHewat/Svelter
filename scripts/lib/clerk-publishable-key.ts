/**
 * Derives the Clerk JWT issuer domain (`https://…`) from a publishable key.
 *
 * Clerk encodes the frontend API hostname in the key (see Clerk docs on publishable keys).
 *
 * @param publishableKey - `pk_test_…` or `pk_live_…`
 * @returns Issuer URL for Convex `CLERK_JWT_ISSUER_DOMAIN`, or null if invalid
 */
export function clerkIssuerDomainFromPublishableKey(
  publishableKey: string,
): string | null {
  const match = publishableKey.trim().match(/^pk_(?:test|live)_(.+)$/);
  if (!match) return null;

  let encoded = match[1];
  const padding = encoded.length % 4;
  if (padding > 0) {
    encoded += "=".repeat(4 - padding);
  }

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const hostname = decoded.replace(/\$$/, "").trim();
    if (!hostname) return null;
    return `https://${hostname}`;
  } catch {
    return null;
  }
}
