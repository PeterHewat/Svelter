import { t as translate, useI18nStore } from "@repo/utils/i18n";
import {
  ensureLocaleLoaded,
  getLocaleDataVersion,
  subscribeLocaleData,
} from "$lib/locale-loader";

/**
 * Reactive i18n for Svelte components — re-renders when the locale or its dictionary changes.
 */
export function useTranslation() {
  const store = useI18nStore;
  let locale = $state(store.getState().locale);
  let localeDataVersion = $state(getLocaleDataVersion());

  $effect(() => {
    const unsubLocale = store.subscribe((state) => {
      locale = state.locale;
      void ensureLocaleLoaded(state.locale);
    });

    const unsubData = subscribeLocaleData(() => {
      localeDataVersion = getLocaleDataVersion();
    });

    void ensureLocaleLoaded(locale);

    return () => {
      unsubLocale();
      unsubData();
    };
  });

  return {
    get locale() {
      return locale;
    },
    t(key: string, variables?: Record<string, string | number>) {
      void localeDataVersion;
      return translate(key, variables, locale);
    },
  };
}
