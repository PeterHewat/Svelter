import { SUPPORTED_LOCALES, type Locale } from "@repo/utils/i18n";

/** SvelteKit param matcher for `[lang=locale]` routes. */
export function match(param: string): param is Locale {
  return param in SUPPORTED_LOCALES;
}
