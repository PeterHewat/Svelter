import { clerkIssuerDomainFromPublishableKey } from "./clerk-publishable-key";

export type ClerkInstance = {
  frontend_api?: string;
  allowed_origins?: string[];
  development_origin?: string | null;
};

/**
 * Fetches Clerk instance settings via the Backend API (`CLERK_SECRET_KEY`).
 *
 * @param secretKey - Clerk development or production secret key
 */
export async function fetchClerkInstance(
  secretKey: string,
): Promise<ClerkInstance | null> {
  const response = await fetch("https://api.clerk.com/v1/instance", {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as ClerkInstance;
}

/**
 * Fetches the Clerk Frontend API host via the Backend API (`CLERK_SECRET_KEY`).
 *
 * @param secretKey - Clerk development or production secret key
 */
export async function fetchClerkFrontendApiHost(
  secretKey: string,
): Promise<string | null> {
  const instance = await fetchClerkInstance(secretKey);
  const host = instance?.frontend_api?.trim();
  return host || null;
}

/**
 * Derives the Clerk JWT issuer from a publishable key (base64-encoded Frontend API host).
 *
 * @param publishableKey - Clerk publishable key (`pk_test_…` / `pk_live_…`)
 */
export function issuerFromPublishableKey(
  publishableKey: string,
): string | null {
  const issuer = clerkIssuerDomainFromPublishableKey(publishableKey);
  if (!issuer) {
    return null;
  }
  return normalizeClerkIssuerDomain(issuer);
}

/**
 * Extracts the Frontend API slug (`mature-dove-78`) from a Clerk publishable key.
 *
 * @param publishableKey - Clerk publishable key (`pk_test_…` / `pk_live_…`)
 */
export function frontendApiSlugFromPublishableKey(
  publishableKey: string,
): string | null {
  const issuer = issuerFromPublishableKey(publishableKey);
  if (!issuer) {
    return null;
  }
  const match = issuer.match(/https?:\/\/([^.]+)\.clerk\.accounts\./);
  return match?.[1] ?? null;
}

/**
 * Resolves Clerk JWT issuer from secret key (API) or publishable key (local decode).
 *
 * @param publishableKey - Clerk publishable key
 * @param secretKey - Optional Clerk secret key
 */
export async function resolveClerkIssuerDomain(
  publishableKey: string,
  secretKey?: string,
): Promise<string | null> {
  if (secretKey) {
    const host = await fetchClerkFrontendApiHost(secretKey);
    if (host) {
      return normalizeClerkIssuerDomain(host);
    }
  }
  return issuerFromPublishableKey(publishableKey);
}

/**
 * Merges origins into Clerk `allowed_origins` (and optionally sets `development_origin`).
 *
 * @param secretKey - Clerk secret key for the target instance
 * @param origins - Origins to ensure are allowed
 * @param options - Optional `development_origin` (e.g. `http://localhost:3000`)
 */
export async function mergeClerkAllowedOrigins(
  secretKey: string,
  origins: string[],
  options?: { developmentOrigin?: string },
): Promise<{ ok: true; added: string[] } | { ok: false; message: string }> {
  const instance = await fetchClerkInstance(secretKey);
  if (!instance) {
    return {
      ok: false,
      message: "Could not read Clerk instance — check CLERK_SECRET_KEY",
    };
  }

  const existing = new Set(instance.allowed_origins ?? []);
  const added = origins.filter((origin) => !existing.has(origin));
  const merged = [...existing, ...added];

  const body: { allowed_origins: string[]; development_origin?: string } = {
    allowed_origins: merged,
  };
  if (options?.developmentOrigin) {
    body.development_origin = options.developmentOrigin;
  }

  const response = await fetch("https://api.clerk.com/v1/instance", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    return { ok: false, message: text.slice(0, 200) };
  }

  return { ok: true, added };
}

/**
 * Normalizes a Clerk JWT issuer domain URL for Convex (`https://….clerk.accounts.dev`).
 *
 * @param input - Frontend API host or full issuer URL
 */
export function normalizeClerkIssuerDomain(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed.replace(/\/$/, "");
  }
  return `https://${trimmed.replace(/\/$/, "")}`;
}

/**
 * Returns true when a string looks like a Clerk publishable key.
 *
 * @param value - Candidate publishable key
 */
export function isClerkPublishableKey(value: string): boolean {
  return /^pk_(test|live)_[a-zA-Z0-9]+$/.test(value.trim());
}

/**
 * Returns true when a string looks like a Clerk secret key.
 *
 * @param value - Candidate secret key
 */
export function isClerkSecretKey(value: string): boolean {
  return /^sk_(test|live)_[a-zA-Z0-9]+$/.test(value.trim());
}

function clerkKeyInstance(value: string): "test" | "live" | null {
  const normalized = value.trim();
  if (normalized.includes("_test_")) {
    return "test";
  }
  if (normalized.includes("_live_")) {
    return "live";
  }
  return null;
}

/**
 * Validates a Clerk publishable key pasted during setup.
 *
 * @param value - Raw publishable key
 */
export function validateClerkPublishableKeyPaste(value: string): string | null {
  const normalized = value.trim();
  if (normalized.startsWith("sk_")) {
    return "That looks like a secret key — paste the publishable key (pk_test_… or pk_live_…)";
  }
  if (!isClerkPublishableKey(normalized)) {
    return "Expected a Clerk publishable key (pk_test_… or pk_live_…).";
  }
  return null;
}

/**
 * Validates a Clerk development publishable key pasted during setup.
 *
 * @param value - Raw publishable key
 */
export function validateClerkDevelopmentPublishableKeyPaste(
  value: string,
): string | null {
  const base = validateClerkPublishableKeyPaste(value);
  if (base) {
    return base;
  }
  if (!value.trim().startsWith("pk_test_")) {
    return "Development setup expects pk_test_… — switch Clerk to Development.";
  }
  return null;
}

/**
 * Validates a Clerk secret key pasted during setup.
 *
 * @param value - Raw secret key
 */
export function validateClerkSecretKeyPaste(value: string): string | null {
  const normalized = value.trim();
  if (normalized.startsWith("pk_")) {
    return "That looks like a publishable key — paste the secret key (sk_test_… or sk_live_…)";
  }
  if (!isClerkSecretKey(normalized)) {
    return "Expected a Clerk secret key (sk_test_… or sk_live_…).";
  }
  return null;
}

/**
 * Validates a Clerk development secret key pasted during setup.
 *
 * @param value - Raw secret key
 */
export function validateClerkDevelopmentSecretKeyPaste(
  value: string,
): string | null {
  const base = validateClerkSecretKeyPaste(value);
  if (base) {
    return base;
  }
  if (!value.trim().startsWith("sk_test_")) {
    return "Development setup expects sk_test_… — switch Clerk to Development.";
  }
  return null;
}

/**
 * Validates a Clerk production publishable key pasted during setup.
 *
 * @param value - Raw publishable key
 */
export function validateClerkProductionPublishableKeyPaste(
  value: string,
): string | null {
  const base = validateClerkPublishableKeyPaste(value);
  if (base) {
    return base;
  }
  if (!value.trim().startsWith("pk_live_")) {
    return "Production setup expects pk_live_… — switch Clerk to Production.";
  }
  return null;
}

/**
 * Validates a Clerk production secret key pasted during setup.
 *
 * @param value - Raw secret key
 */
export function validateClerkProductionSecretKeyPaste(
  value: string,
): string | null {
  const base = validateClerkSecretKeyPaste(value);
  if (base) {
    return base;
  }
  if (!value.trim().startsWith("sk_live_")) {
    return "Production setup expects sk_live_… — switch Clerk to Production.";
  }
  return null;
}

/**
 * Validates a Clerk production publishable + secret key pair.
 *
 * @param publishableKey - Clerk production publishable key
 * @param secretKey - Clerk production secret key
 */
export function validateClerkProductionKeys(
  publishableKey: string,
  secretKey: string,
): string | null {
  return (
    validateClerkProductionPublishableKeyPaste(publishableKey) ??
    validateClerkProductionSecretKeyPaste(secretKey) ??
    validateClerkKeyPair(publishableKey, secretKey)
  );
}

/**
 * Validates a Clerk development publishable + secret key pair.
 *
 * @param publishableKey - Clerk development publishable key
 * @param secretKey - Clerk development secret key
 */
export function validateClerkDevelopmentKeys(
  publishableKey: string,
  secretKey: string,
): string | null {
  return (
    validateClerkDevelopmentPublishableKeyPaste(publishableKey) ??
    validateClerkDevelopmentSecretKeyPaste(secretKey) ??
    validateClerkKeyPair(publishableKey, secretKey)
  );
}

/**
 * Ensures Clerk publishable and secret keys are distinct and from the same instance.
 *
 * @param publishableKey - Clerk publishable key
 * @param secretKey - Clerk secret key
 */
export function validateClerkKeyPair(
  publishableKey: string,
  secretKey: string,
): string | null {
  if (publishableKey.trim() === secretKey.trim()) {
    return "Publishable key and secret key must be different values";
  }
  const pkInstance = clerkKeyInstance(publishableKey);
  const skInstance = clerkKeyInstance(secretKey);
  if (pkInstance && skInstance && pkInstance !== skInstance) {
    return "Publishable and secret keys must be from the same Clerk instance (both test or both live)";
  }
  return null;
}
