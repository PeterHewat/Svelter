import type { FlattenKeys } from "@repo/utils";
import {
  registerTranslations,
  SUPPORTED_LOCALES,
  t,
  type Locale,
} from "@repo/utils/i18n";
import de from "./locales/de";
import en from "./locales/en";
import es from "./locales/es";
import fr from "./locales/fr";
import it from "./locales/it";
import nl from "./locales/nl";
import pl from "./locales/pl";
import pt from "./locales/pt";
import ru from "./locales/ru";

export type MarketingTranslationKey = FlattenKeys<typeof en>;

export type MarketingT = (
  key: MarketingTranslationKey,
  vars?: Record<string, string | number>,
) => string;

export const MARKETING_LOCALES = Object.keys(SUPPORTED_LOCALES) as Locale[];

export const DEFAULT_MARKETING_LOCALE: Locale = "en";

let registered = false;

/**
 * Register marketing translations once (safe at prerender / SSR).
 */
export function ensureMarketingI18n(): void {
  if (registered) return;
  registerTranslations("en", en);
  registerTranslations("es", es);
  registerTranslations("fr", fr);
  registerTranslations("de", de);
  registerTranslations("pt", pt);
  registerTranslations("it", it);
  registerTranslations("nl", nl);
  registerTranslations("pl", pl);
  registerTranslations("ru", ru);
  registered = true;
}

/**
 * Translate a marketing key for a prerendered locale (no client store).
 *
 * @param key - Dot-notation translation key
 * @param locale - Target locale from the URL
 * @param variables - Optional interpolation values
 */
export function mt(
  key: MarketingTranslationKey,
  locale: Locale,
  variables?: Record<string, string | number>,
): string {
  ensureMarketingI18n();
  return t(key, variables, locale);
}

/**
 * Returns a translator function bound to a locale.
 *
 * @param locale - Target locale from the URL
 */
export function createMarketingT(locale: Locale): MarketingT {
  return (key, vars) => mt(key, locale, vars);
}

/**
 * Prerender entry list for every supported marketing locale.
 */
export function localeEntries(): Array<{ lang: Locale }> {
  return MARKETING_LOCALES.map((lang) => ({ lang }));
}

export { SUPPORTED_LOCALES, type Locale };
