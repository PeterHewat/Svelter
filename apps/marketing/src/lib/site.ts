import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@repo/config/product";

export const SITE_NAME = PRODUCT_NAME;
export const SITE_TAGLINE = PRODUCT_TAGLINE;

/** Resolved at marketing build time from git remote / `GITHUB_REPOSITORY`. */
export const GITHUB_REPO_URL = __GITHUB_REPO_URL__;
