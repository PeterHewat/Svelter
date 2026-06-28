import type { Locale } from "@repo/utils/i18n";

/**
 * Build a locale-prefixed path (`/en`, `/fr/blog`, …).
 *
 * @param locale - Locale segment
 * @param path - Optional path without leading slash (e.g. `blog/hello-world`)
 */
export function localizedPath(locale: Locale, path = ""): string {
  const trimmed = path.replace(/^\/+/, "");
  return trimmed ? `/${locale}/${trimmed}` : `/${locale}`;
}

/**
 * Build a locale-prefixed homepage URL with a hash fragment (e.g. `/en#pricing`).
 *
 * @param locale - Locale segment
 * @param fragment - Section id without `#`
 */
export function localizedAnchor(locale: Locale, fragment: string): string {
  const id = fragment.replace(/^#/, "");
  return `${localizedPath(locale)}#${id}`;
}

/**
 * Build a locale-prefixed legal page URL with a hash fragment (e.g. `/en/legal#privacy`).
 *
 * @param locale - Locale segment
 * @param fragment - Section id without `#` (`security`, `privacy`, `terms`)
 */
export function localizedLegalAnchor(locale: Locale, fragment: string): string {
  const id = fragment.replace(/^#/, "");
  return `${localizedPath(locale, "legal")}#${id}`;
}

/**
 * Swap the locale segment in the current pathname.
 *
 * @param pathname - Current URL pathname (e.g. `/en/blog/hello-world`)
 * @param targetLocale - Destination locale
 */
export function switchLocalePath(
  pathname: string,
  targetLocale: Locale,
): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return localizedPath(targetLocale);
  }
  segments[0] = targetLocale;
  return `/${segments.join("/")}`;
}
