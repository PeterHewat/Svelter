import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  anonymousAuthErrorResponse,
  anonymousAuthJsonResponse,
  anonymousAuthOptionsResponse,
  issueAnonymousSession,
  parseAnonymousAuthBody,
} from "./lib/anonymous_session";

const http = httpRouter();

http.route({
  path: "/auth/anonymous",
  method: "OPTIONS",
  handler: httpAction(async () => anonymousAuthOptionsResponse()),
});

http.route({
  path: "/auth/anonymous",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const existingUserId = await parseAnonymousAuthBody(request);
      const payload = await issueAnonymousSession(ctx, existingUserId);
      return anonymousAuthJsonResponse(payload);
    } catch (error) {
      return anonymousAuthErrorResponse(error);
    }
  }),
});

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim();
    if (!signingSecret) {
      return new Response("Webhook not configured", { status: 501 });
    }

    const payload = await request.text();
    const headers = {
      "svix-id": request.headers.get("svix-id") ?? "",
      "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
      "svix-signature": request.headers.get("svix-signature") ?? "",
    };

    let event: { type: string; data: unknown };
    try {
      const { Webhook } = await import("standardwebhooks");
      const webhook = new Webhook(signingSecret);
      event = webhook.verify(payload, headers) as {
        type: string;
        data: unknown;
      };
    } catch {
      return new Response("Invalid signature", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;
      case "user.deleted": {
        const data = event.data as { id?: string };
        if (data.id) {
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkUserId: data.id,
          });
        }
        break;
      }
      default:
        break;
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
