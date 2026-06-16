import { t as translate, useI18nStore } from "@repo/utils/i18n";

/**
 * Reactive i18n for Svelte components — re-renders when the locale changes.
 */
export function useTranslation() {
  const store = useI18nStore;
  let locale = $state(store.getState().locale);

  $effect(() => {
    return store.subscribe((state) => {
      locale = state.locale;
    });
  });

  return {
    get locale() {
      return locale;
    },
    t(key: string, variables?: Record<string, string | number>) {
      return translate(key, variables, locale);
    },
  };
}
