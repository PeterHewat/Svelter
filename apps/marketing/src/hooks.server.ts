import type { Handle } from "@sveltejs/kit";

/** Inject `<html lang="…">` from the locale route param during prerender. */
export const handle: Handle = async ({ event, resolve }) => {
  const lang = event.params.lang ?? "en";

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%lang%", lang),
  });
};
