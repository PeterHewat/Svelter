import type { FlattenKeys } from "@repo/utils";
import {
  initializeI18n,
  registerTranslations,
  t as translate,
  useI18nStore,
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

export type TranslationKey = FlattenKeys<typeof en>;

registerTranslations("en", en);
registerTranslations("es", es);
registerTranslations("fr", fr);
registerTranslations("de", de);
registerTranslations("pt", pt);
registerTranslations("it", it);
registerTranslations("nl", nl);
registerTranslations("pl", pl);
registerTranslations("ru", ru);
initializeI18n();

/**
 * Translate a key using the current locale (non-reactive; prefer {@link useTranslation} in components).
 */
export function t(
  key: string,
  variables?: Record<string, string | number>,
  locale?: Locale,
): string {
  return translate(key, variables, locale);
}

export { useTranslation } from "./use-translation.svelte";
export { en, useI18nStore };
