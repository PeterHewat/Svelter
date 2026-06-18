import { webDevOrigin } from "./dev-ports";

/**
 * Default product name for web UI, marketing site, and tests.
 * After adopting the template, change this once and update locale strings if needed.
 */
export const PRODUCT_NAME = "Svelter";

/** Default marketing site tagline suffix (home page title). */
export const PRODUCT_TAGLINE =
  "SvelteKit + Convex + Clerk + Tailwind + Bun monorepo starter for your product app and marketing site";

/** Product SPA origin for marketing CTAs (replace with production URL in v1). */
export const PRODUCT_APP_URL = webDevOrigin;

/** Signup route on the product app (composed with {@link PRODUCT_APP_URL}). */
export const PRODUCT_SIGNUP_PATH = "/sign-up";

/** External docs site linked from marketing nav and footer (replace in v1). */
export const DOCS_URL = "https://docs.example.com";
