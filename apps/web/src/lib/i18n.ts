import type { FlattenKeys } from "@repo/utils";
import { initializeI18n, t as translate, useI18nStore } from "@repo/utils/i18n";
import en from "./locales/en";
import "./locale-loader";

export type TranslationKey = FlattenKeys<typeof en>;

initializeI18n();

/**
 * Translate a key using the current locale (non-reactive; prefer {@link useTranslation} in components).
 */
export function t(
  key: string,
  variables?: Record<string, string | number>,
  locale?: Parameters<typeof translate>[2],
): string {
  return translate(key, variables, locale);
}

export { useTranslation } from "./use-translation.svelte";
export { en, useI18nStore };
