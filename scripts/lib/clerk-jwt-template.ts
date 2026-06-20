/** Clerk JWT template name required by `ConvexProviderWithClerk` (`getToken({ template: "convex" })`). */
export const CLERK_CONVEX_JWT_TEMPLATE_NAME = "convex";

/**
 * Claims matching Clerk's dashboard **Convex** preset (`aud` must be `convex` for `auth.config.ts`).
 *
 * @see https://docs.convex.dev/auth/clerk
 */
export const CLERK_CONVEX_JWT_CLAIMS = {
  aud: "convex",
  name: "{{user.full_name}}",
  email: "{{user.primary_email_address}}",
  picture: "{{user.image_url}}",
  nickname: "{{user.username}}",
  given_name: "{{user.first_name}}",
  family_name: "{{user.last_name}}",
} as const;

type ClerkJwtTemplateRecord = {
  id?: string;
  name?: string;
  claims?: Record<string, unknown>;
};

type ClerkJwtTemplateListResponse = {
  data?: ClerkJwtTemplateRecord[];
  total_count?: number;
};

type ClerkApiErrorResponse = {
  errors?: Array<{ code?: string; message?: string }>;
};

export type EnsureClerkConvexJwtTemplateResult =
  | { ok: true; created: boolean; updated?: boolean }
  | { ok: false; message: string };

function isConvexJwtTemplateName(name: string | undefined): boolean {
  return name?.trim().toLowerCase() === CLERK_CONVEX_JWT_TEMPLATE_NAME;
}

function isClerkJwtTemplateNameTakenError(body: string): boolean {
  if (/form_identifier_exists|name is taken/i.test(body)) {
    return true;
  }
  try {
    const parsed = JSON.parse(body) as ClerkApiErrorResponse;
    return (parsed.errors ?? []).some(
      (error) =>
        error.code === "form_identifier_exists" ||
        /name is taken/i.test(error.message ?? ""),
    );
  } catch {
    return false;
  }
}

function convexJwtClaimsNeedSync(
  existing: Record<string, unknown> | undefined,
): boolean {
  if (!existing) {
    return true;
  }
  for (const [key, value] of Object.entries(CLERK_CONVEX_JWT_CLAIMS)) {
    if (existing[key] !== value) {
      return true;
    }
  }
  return false;
}

/**
 * Lists Clerk JWT templates (paginated).
 *
 * @param secretKey - Clerk secret key
 */
async function listClerkJwtTemplates(
  secretKey: string,
): Promise<ClerkJwtTemplateRecord[]> {
  const limit = 100;
  let offset = 0;
  const templates: ClerkJwtTemplateRecord[] = [];

  while (true) {
    const url = new URL("https://api.clerk.com/v1/jwt_templates");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!response.ok) {
      return templates;
    }

    const body = (await response.json()) as ClerkJwtTemplateListResponse;
    const page = body.data ?? [];
    templates.push(...page);

    offset += page.length;
    const total = body.total_count ?? page.length;
    if (page.length === 0 || offset >= total) {
      return templates;
    }
  }
}

/**
 * Returns true when the Clerk instance has a JWT template named `convex`.
 *
 * @param secretKey - Clerk secret key (`sk_test_…` / `sk_live_…`)
 */
export async function hasClerkConvexJwtTemplate(
  secretKey: string,
): Promise<boolean> {
  const templates = await listClerkJwtTemplates(secretKey);
  return templates.some((template) => isConvexJwtTemplateName(template.name));
}

/**
 * Ensures Clerk has the `convex` JWT template with profile claims (`picture`, etc.).
 *
 * @param secretKey - Clerk secret key (`sk_test_…` / `sk_live_…`)
 */
export async function ensureClerkConvexJwtTemplate(
  secretKey: string,
): Promise<EnsureClerkConvexJwtTemplateResult> {
  const templates = await listClerkJwtTemplates(secretKey);
  const existing = templates.find((template) =>
    isConvexJwtTemplateName(template.name),
  );

  if (existing?.id) {
    if (!convexJwtClaimsNeedSync(existing.claims)) {
      return { ok: true, created: false, updated: false };
    }

    const response = await fetch(
      `https://api.clerk.com/v1/jwt_templates/${encodeURIComponent(existing.id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claims: CLERK_CONVEX_JWT_CLAIMS,
          lifetime: 3600,
          allowed_clock_skew: 5,
        }),
      },
    );

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 200);
      return {
        ok: false,
        message:
          detail || `Clerk JWT template PATCH returned ${response.status}`,
      };
    }

    return { ok: true, created: false, updated: true };
  }

  const response = await fetch("https://api.clerk.com/v1/jwt_templates", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: CLERK_CONVEX_JWT_TEMPLATE_NAME,
      claims: CLERK_CONVEX_JWT_CLAIMS,
      lifetime: 3600,
      allowed_clock_skew: 5,
      custom_signing_key: false,
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 200);
    if (isClerkJwtTemplateNameTakenError(detail)) {
      return { ok: true, created: false, updated: false };
    }
    return {
      ok: false,
      message: detail || `Clerk JWT template API returned ${response.status}`,
    };
  }

  return { ok: true, created: true, updated: false };
}
