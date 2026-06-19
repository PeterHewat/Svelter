import { type Locale, SUPPORTED_LOCALES, useI18nStore } from "./i18n";
import { getLocalStorageOrMemory } from "./storage";
import {
  getSystemTheme,
  type ResolvedTheme,
  type ThemeMode,
  useThemeStore,
} from "./theme";

/** Query param used when linking from marketing → product (different origins). */
export const CROSS_APP_LANG_PARAM = "lang";

/** Query param used when linking between marketing ↔ product (different origins). */
export const CROSS_APP_THEME_PARAM = "theme";

/** Query keys removed from the address bar after cross-app prefs are persisted. */
export const CROSS_APP_PREF_PARAMS = [
  CROSS_APP_LANG_PARAM,
  CROSS_APP_THEME_PARAM,
] as const;

function isLocale(value: string): value is Locale {
  return value in SUPPORTED_LOCALES;
}

/**
 * Read the persisted theme mode from shared `theme` localStorage (Zustand shape).
 *
 * @returns Stored mode or `null` when unset / invalid
 */
export function readStoredThemeMode(): ThemeMode | null {
  try {
    const raw = getLocalStorageOrMemory().getItem("theme");
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { state?: { mode?: string } };
    const mode = parsed.state?.mode;
    if (mode === "light" || mode === "dark" || mode === "system") {
      return mode;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Read the persisted locale from shared `i18n` localStorage (Zustand shape).
 *
 * @returns Stored locale or `null` when unset / invalid
 */
export function readStoredLocale(): Locale | null {
  try {
    const raw = getLocalStorageOrMemory().getItem("i18n");
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { state?: { locale?: string } };
    const locale = parsed.state?.locale;
    if (locale && isLocale(locale)) {
      return locale;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Resolved light/dark theme for cross-app URL params (never `system`).
 *
 * @returns Explicit or system-resolved theme, or `null` outside the browser
 */
export function readResolvedCrossAppTheme(): ResolvedTheme | null {
  const mode = readStoredThemeMode();
  if (!mode) {
    return typeof window !== "undefined" ? getSystemTheme() : null;
  }
  if (mode === "light" || mode === "dark") {
    return mode;
  }
  return getSystemTheme();
}

/**
 * Append cross-app preference query params to a URL.
 *
 * @param url - Target URL (mutated in place)
 * @param prefs - Optional locale and/or resolved theme override
 */
export function appendCrossAppPrefs(
  url: URL,
  prefs: { lang?: string; theme?: "light" | "dark" },
): void {
  if (prefs.lang) {
    url.searchParams.set(CROSS_APP_LANG_PARAM, prefs.lang);
  }
  if (prefs.theme) {
    url.searchParams.set(CROSS_APP_THEME_PARAM, prefs.theme);
  }
}

/**
 * Apply `lang` / `theme` query params from a cross-app navigation link.
 *
 * @param searchParams - Current page query string
 */
export function applyCrossAppPrefsFromUrl(searchParams: URLSearchParams): void {
  const lang = searchParams.get(CROSS_APP_LANG_PARAM);
  if (lang && isLocale(lang)) {
    useI18nStore.getState().setLocale(lang);
  }

  const theme = searchParams.get(CROSS_APP_THEME_PARAM);
  if (theme === "light" || theme === "dark") {
    useThemeStore.getState().setMode(theme);
  }
}

/**
 * Remove cross-app pref params from a query string.
 *
 * @param searchParams - Query string to mutate
 * @returns Whether any cross-app pref param was removed
 */
export function stripCrossAppPrefsFromSearchParams(
  searchParams: URLSearchParams,
): boolean {
  let stripped = false;
  for (const key of CROSS_APP_PREF_PARAMS) {
    if (searchParams.has(key)) {
      searchParams.delete(key);
      stripped = true;
    }
  }
  return stripped;
}

/**
 * Same-page URL without cross-app pref query params.
 *
 * @param url - Current page URL
 * @returns `pathname` + `search` + `hash` when prefs were present, else `null`
 * @example
 * urlWithoutCrossAppPrefs(new URL("https://app.example.com/?lang=fr&theme=dark"));
 * // "/"
 */
export function urlWithoutCrossAppPrefs(url: URL): string | null {
  const params = new URLSearchParams(url.search);
  if (!stripCrossAppPrefsFromSearchParams(params)) {
    return null;
  }
  const search = params.toString();
  return `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
}
