import { resolveMarketingSiteOrigin } from "@repo/config/cross-app-origin";
import type { Locale } from "@repo/utils/i18n";
import {
  appendCrossAppPrefs,
  readResolvedCrossAppTheme,
} from "@repo/utils/cross-app-prefs";

export type MarketingSiteHrefOptions = {
  /** Resolved theme for cross-app navigation (`light` / `dark`). */
  theme?: "light" | "dark";
};

function marketingSiteOriginFromBrowser(): string {
  if (typeof window === "undefined") {
    return "http://localhost:3001";
  }

  return resolveMarketingSiteOrigin(window.location).replace(/\/$/, "");
}

/**
 * Build an absolute URL to the marketing site from the product app.
 *
 * Resolved at runtime from the current URL (port ±1, pages.dev swap, or apex www).
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
  const origin = marketingSiteOriginFromBrowser();
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
