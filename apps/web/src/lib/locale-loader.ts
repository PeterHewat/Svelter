import {
  registerTranslations,
  useI18nStore,
  type Locale,
  type TranslationDictionary,
} from "@repo/utils/i18n";
import en from "./locales/en";

const localeLoaders: Record<
  Exclude<Locale, "en">,
  () => Promise<{ default: TranslationDictionary }>
> = {
  de: () => import("./locales/de"),
  es: () => import("./locales/es"),
  fr: () => import("./locales/fr"),
  it: () => import("./locales/it"),
  nl: () => import("./locales/nl"),
  pl: () => import("./locales/pl"),
  pt: () => import("./locales/pt"),
  ru: () => import("./locales/ru"),
};

const loadedLocales = new Set<Locale>(["en"]);
const loadingLocales = new Map<Locale, Promise<void>>();
let localeDataVersion = 0;
const localeDataListeners = new Set<() => void>();

registerTranslations("en", en);

/**
 * Bumps when async locale dictionaries finish loading so reactive callers re-render.
 */
export function getLocaleDataVersion(): number {
  return localeDataVersion;
}

/**
 * Subscribe to locale dictionary load completion (for reactive translation hooks).
 *
 * @returns Unsubscribe function
 */
export function subscribeLocaleData(listener: () => void): () => void {
  localeDataListeners.add(listener);
  return () => localeDataListeners.delete(listener);
}

function notifyLocaleDataLoaded(): void {
  localeDataVersion += 1;
  for (const listener of localeDataListeners) {
    listener();
  }
}

/**
 * Load and register translations for a locale if not already available.
 *
 * @param locale - Target locale
 * @returns Resolves when translations are registered
 */
export function ensureLocaleLoaded(locale: Locale): Promise<void> {
  if (loadedLocales.has(locale)) {
    return Promise.resolve();
  }

  const pending = loadingLocales.get(locale);
  if (pending) {
    return pending;
  }

  const load =
    locale === "en"
      ? Promise.resolve()
      : localeLoaders[locale]().then((module) => {
          registerTranslations(locale, module.default);
        });

  const promise = load
    .then(() => {
      loadedLocales.add(locale);
      notifyLocaleDataLoaded();
    })
    .finally(() => {
      loadingLocales.delete(locale);
    });

  loadingLocales.set(locale, promise);
  return promise;
}

useI18nStore.subscribe((state, previous) => {
  if (state.locale !== previous.locale) {
    void ensureLocaleLoaded(state.locale);
  }
});

void ensureLocaleLoaded(useI18nStore.getState().locale);
