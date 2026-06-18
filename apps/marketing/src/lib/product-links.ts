import { PRODUCT_APP_URL, PRODUCT_SIGNUP_PATH } from "@repo/config/product";

export type ProductLinkKind = "signup" | "login";

export type ProductAppHrefOptions = {
  /** Signup (default) or product app home for login. */
  kind?: ProductLinkKind;
  /** Optional UTM campaign appended as query params. */
  utmCampaign?: string;
};

/**
 * Build an absolute URL to the product app for marketing CTAs.
 *
 * @param options - Link kind and optional UTM campaign
 * @returns Fully qualified product app URL
 * @example
 * productAppHref({ kind: "signup", utmCampaign: "hero" });
 * // "http://localhost:3000/sign-up?utm_source=marketing&utm_medium=cta&utm_campaign=hero"
 */
export function productAppHref(options: ProductAppHrefOptions = {}): string {
  const { kind = "signup", utmCampaign } = options;
  const path = kind === "signup" ? PRODUCT_SIGNUP_PATH : "/";
  const url = new URL(path, PRODUCT_APP_URL);

  if (utmCampaign) {
    url.searchParams.set("utm_source", "marketing");
    url.searchParams.set("utm_medium", "cta");
    url.searchParams.set("utm_campaign", utmCampaign);
  }

  return url.toString();
}
