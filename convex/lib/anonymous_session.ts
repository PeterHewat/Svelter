import { ConvexError } from "convex/values";
import { SignJWT, importPKCS8 } from "jose";
import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { CONVEX_JWT_AUDIENCE } from "./constants";
import {
  getAnonAuthIssuer,
  getAnonPrivateKeyPem,
  isAnonymousSubject,
} from "./anon_auth";
import { createAnonymousUserId } from "../model/users";

const ANON_TOKEN_TTL_SECONDS = 60 * 60 * 24;

export type AnonymousTokenResponse = {
  token: string;
  userId: string;
  expiresIn: number;
};

/**
 * Mints a signed anonymous JWT for a guest user id.
 *
 * @param userId - Existing or new anonymous owner id
 */
export async function mintAnonymousJwt(userId: string): Promise<string> {
  const privateKey = await importPKCS8(getAnonPrivateKeyPem(), "RS256");
  const issuer = getAnonAuthIssuer();
  const now = Math.floor(Date.now() / 1000);

  return await new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: "anon-auth", typ: "JWT" })
    .setSubject(userId)
    .setIssuer(issuer)
    .setAudience(CONVEX_JWT_AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + ANON_TOKEN_TTL_SECONDS)
    .sign(privateKey);
}

/**
 * Creates or refreshes a guest session and returns a Convex auth token.
 *
 * @param ctx - HTTP action context
 * @param existingUserId - Optional persisted guest id from the browser
 */
export async function issueAnonymousSession(
  ctx: ActionCtx,
  existingUserId?: string,
): Promise<AnonymousTokenResponse> {
  let userId = existingUserId?.trim();

  if (userId && isAnonymousSubject(userId)) {
    try {
      await ctx.runMutation(internal.users.validateAnonymousUser, {
        tokenIdentifier: userId,
      });
    } catch {
      userId = undefined;
    }
  }

  if (!userId) {
    userId = createAnonymousUserId();
    await ctx.runMutation(internal.users.createAnonymousUser, {
      tokenIdentifier: userId,
    });
  }

  const token = await mintAnonymousJwt(userId);
  return {
    token,
    userId,
    expiresIn: ANON_TOKEN_TTL_SECONDS,
  };
}

/**
 * Parses optional JSON body `{ userId?: string }` from an anonymous auth request.
 */
export async function parseAnonymousAuthBody(
  request: Request,
): Promise<string | undefined> {
  try {
    const body = (await request.json()) as { userId?: unknown };
    return typeof body.userId === "string" ? body.userId : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Serializes an anonymous auth response with CORS headers.
 */
export function anonymousAuthJsonResponse(
  payload: AnonymousTokenResponse,
): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

/**
 * CORS preflight for anonymous auth endpoint.
 */
export function anonymousAuthOptionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

/**
 * Error response for anonymous auth endpoint.
 */
export function anonymousAuthErrorResponse(error: unknown): Response {
  const message =
    error instanceof ConvexError
      ? String(error.message)
      : "Anonymous auth failed";
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
