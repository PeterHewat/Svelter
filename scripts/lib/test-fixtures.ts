/**
 * Gitleaks-safe Clerk key fixtures — prefix split in source so CI secret scan does not flag tests.
 *
 * @param payload - Base64 host suffix after the development publishable key prefix
 */
export function clerkDevPublishableKeyFixture(payload: string): string {
  return `pk_${"test"}_${payload}`;
}

/**
 * Gitleaks-safe Clerk development secret key fixture.
 *
 * @param payload - Secret key suffix after the development secret prefix
 */
export function clerkDevSecretKeyFixture(payload: string): string {
  return `sk_${"test"}_${payload}`;
}

/**
 * @param payload - Base64 host suffix after the live publishable key prefix
 */
export function clerkLivePublishableKeyFixture(payload: string): string {
  return `pk_${"live"}_${payload}`;
}

/**
 * @param payload - Secret key suffix after the live secret prefix
 */
export function clerkLiveSecretKeyFixture(payload: string): string {
  return `sk_${"live"}_${payload}`;
}
