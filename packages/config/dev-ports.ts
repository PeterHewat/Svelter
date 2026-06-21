/** Local Vite dev server for the product web app (`apps/web`). */
export const WEB_DEV_PORT = 3000;

/** Local Vite dev server for the marketing site (`apps/marketing`). */
export const MARKETING_DEV_PORT = 3001;

/** Local `vite preview` server for the product web app. */
export const WEB_PREVIEW_PORT = 4000;

/** Local `vite preview` server for the marketing site. */
export const MARKETING_PREVIEW_PORT = 4001;

/** Product web app origin during local development. */
export const webDevOrigin = `http://localhost:${WEB_DEV_PORT}` as const;

/** Marketing site origin during local development. */
export const marketingDevOrigin =
  `http://localhost:${MARKETING_DEV_PORT}` as const;
