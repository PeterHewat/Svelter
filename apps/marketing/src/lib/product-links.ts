import { resolveProductAppOrigin } from "@repo/config/app-origins";
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
};

/**
 * Build an absolute URL to the product app for marketing CTAs.
 *
 * @param options - Optional locale and theme for cross-app preference sync
 * @returns Fully qualified product app URL (app root)
 * @example
 * productAppHref({ lang: "fr", theme: "dark" });
 * // "http://localhost:3000/?lang=fr&theme=dark"
 */
export function productAppHref(options: ProductAppHrefOptions = {}): string {
  const { lang, theme } = options;
  const url = new URL("/", resolveProductAppOrigin());

  appendCrossAppPrefs(url, {
    lang,
    theme: theme ?? readResolvedCrossAppTheme() ?? undefined,
  });

  return url.toString();
}

/** Product app origin used to patch CTA hrefs client-side on the marketing site. */
export function productAppOrigin(): string {
  return resolveProductAppOrigin().replace(/\/$/, "");
}
