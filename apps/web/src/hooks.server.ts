/**
 * Static SPA (`ssr = false`, adapter-static): auth runs in the browser only.
 * Skip `withClerkHandler` so preview does not run Clerk handshake redirects or
 * set `__client_uat=0` before client JS (which used to trigger eager Clerk load).
 */
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => resolve(event);
