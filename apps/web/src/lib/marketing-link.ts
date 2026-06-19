import { resolveMarketingOrigin } from "@repo/config/app-origins";
import type { Locale } from "@repo/utils/i18n";
import {
  appendCrossAppPrefs,
  readResolvedCrossAppTheme,
} from "@repo/utils/cross-app-prefs";

export type MarketingSiteHrefOptions = {
  /** Resolved theme for cross-app navigation (`light` / `dark`). */
  theme?: "light" | "dark";
};

/**
 * Build an absolute URL to the marketing site from the product app.
 *
 * @param path - Optional path after the origin (e.g. `en`, `en/docs`)
 * @param options - Optional cross-app preference overrides
 * @returns Fully qualified marketing site URL
 * @example
 * marketingSiteHref("fr", { theme: "dark" });
 * // "http://localhost:3001/fr?theme=dark"
 */
export function marketingSiteHref(
  path = "",
  options: MarketingSiteHrefOptions = {},
): string {
  const origin = resolveMarketingOrigin().replace(/\/$/, "");
  const trimmed = path.replace(/^\/+/, "");
  const url = new URL(trimmed ? `/${trimmed}` : "/", origin);

  appendCrossAppPrefs(url, {
    theme: options.theme ?? readResolvedCrossAppTheme() ?? undefined,
  });

  return url.toString().replace(/\/$/, trimmed ? "" : "/");
}

/**
 * Marketing home URL for the active product locale.
 *
 * @param locale - Product app locale
 * @param options - Optional cross-app preference overrides
 */
export function marketingHomeHref(
  locale: Locale,
  options: MarketingSiteHrefOptions = {},
): string {
  return marketingSiteHref(locale, options);
}
