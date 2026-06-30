/**
 * Default product name for web UI, marketing site, and tests.
 * After adopting the template, change this once and update locale strings if needed.
 */
export const PRODUCT_NAME = "Svelter";

/** Default marketing site tagline suffix (home page title). */
export const PRODUCT_TAGLINE =
  "A production-ready monorepo template for product and marketing websites.";

/**
 * Clerk sign-up path on the **product** app (`apps/web`), not marketing.
 *
 * Marketing CTAs link to the product origin root (`productAppHref("/")`) — users
 * sign up via the in-app Clerk modal, not a marketing URL. This constant exists
 * so deep links (e.g. `productAppHref(PRODUCT_SIGNUP_PATH)`) stay centralized if
 * you add a dedicated `/sign-up` route later; Clerk’s default is `/sign-up`.
 */
export const PRODUCT_SIGNUP_PATH = "/sign-up";
