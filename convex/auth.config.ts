import type { AuthConfig } from "convex/server";

/**
 * Clerk JWT validation and anonymous guest JWTs for Convex.
 *
 * Convex dashboard env:
 * - `CLERK_JWT_ISSUER_DOMAIN` — Clerk Frontend API URL
 * - `ANON_AUTH_ISSUER` — deployment `.convex.site` origin
 * - `ANON_AUTH_JWKS` — base64 data URI JWKS for the anonymous key pair
 * - `ANON_AUTH_PRIVATE_KEY` — PEM private key (HTTP action signing only)
 *
 * @see https://docs.convex.dev/auth/clerk
 * @see https://docs.convex.dev/auth/advanced/custom-jwt
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
    ...(process.env.ANON_AUTH_ISSUER && process.env.ANON_AUTH_JWKS
      ? [
          {
            type: "customJwt" as const,
            applicationID: "convex",
            issuer: process.env.ANON_AUTH_ISSUER,
            jwks: process.env.ANON_AUTH_JWKS,
            algorithm: "RS256" as const,
          },
        ]
      : []),
  ],
} satisfies AuthConfig;
