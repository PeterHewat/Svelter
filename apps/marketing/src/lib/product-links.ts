import type { Locale } from "@repo/utils/i18n";
import {
  appendCrossAppPrefs,
  readResolvedCrossAppTheme,
} from "@repo/utils/cross-app-prefs";

export type ProductAppHrefOptions = {
  /** Marketing page locale — forwarded to the product app when origins differ. */
  lang?: Locale;
  /** Resolved theme override — defaults to stored preference when in the browser. */
  theme?: "light" | "dark";
  /** When true, opens the product app sign-in dialog via `?auth=login`. */
  auth?: boolean;
};

/**
 * Product app origin baked into apex release builds for no-JS CTAs.
 *
 * @returns Absolute product origin, or `null` when resolved at runtime via `init.js`
 */
export function bakedProductAppOrigin(): string | null {
  if (typeof __BAKED_PRODUCT_APP_ORIGIN__ === "undefined") {
    return null;
  }
  return __BAKED_PRODUCT_APP_ORIGIN__;
}

/**
 * Build an absolute URL to the product app for marketing CTAs.
 *
 * Apex release builds bake the href; all other tiers use `#` until `init.js` patches it.
 *
 * @param options - Optional locale and theme for cross-app preference sync
 * @returns Fully qualified product app URL, or `#` when patched at runtime
 * @example
 * productAppHref({ lang: "fr", theme: "dark" });
 * // apex build: "https://example.com/?lang=fr&theme=dark"
 */
export function productAppHref(options: ProductAppHrefOptions = {}): string {
  const baked = bakedProductAppOrigin();
  if (!baked) {
    return "#";
  }

  const { lang, theme, auth } = options;
  const url = new URL("/", baked);

  appendCrossAppPrefs(url, {
    lang,
    theme: theme ?? readResolvedCrossAppTheme() ?? undefined,
  });

  if (auth) {
    url.searchParams.set("auth", "login");
  }

  return url.toString();
}

/** Baked product app origin for the apex `<meta name="product-app-origin">` tag. */
export function productAppOriginMetaContent(): string | null {
  return bakedProductAppOrigin();
}
