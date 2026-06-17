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

/**
 * Prerender entry list for every supported marketing locale.
 */
export function localeEntries(): Array<{ lang: Locale }> {
  return (["en", "es", "fr", "de", "pt", "it", "nl", "pl", "ru"] as const).map(
    (lang) => ({ lang }),
  );
}
