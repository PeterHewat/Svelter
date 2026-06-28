import { I18N_KEY, LOCALE_NAV_KEY, SUPPORTED_LOCALES } from "./constants.js";
import { captureScrollState } from "./scroll.js";

export function isSupportedLocale(lang) {
  return SUPPORTED_LOCALES.indexOf(lang) !== -1;
}

export function localeFromPath(path) {
  var match = /^\/([a-z]{2})(?:\/|$)/.exec(path);
  if (match && isSupportedLocale(match[1])) {
    return match[1];
  }
  return null;
}

export function readStoredLocale() {
  try {
    var raw = localStorage.getItem(I18N_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.state &&
        parsed.state.locale &&
        isSupportedLocale(parsed.state.locale)
      ) {
        return parsed.state.locale;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeLocale(locale) {
  localStorage.setItem(
    I18N_KEY,
    JSON.stringify({ state: { locale: locale }, version: 0 }),
  );
}

export function getBrowserLocale() {
  var lang = (navigator.language || "").split("-")[0];
  return isSupportedLocale(lang) ? lang : "en";
}

export function resolvePreferredLocale() {
  return readStoredLocale() || getBrowserLocale();
}

export function redirectUnlocalizedPaths() {
  var path = location.pathname.replace(/\/$/, "") || "/";
  var locale = resolvePreferredLocale();

  if (path === "/") {
    location.replace("/" + locale + "/");
    return true;
  }

  return false;
}

export function persistLocaleFromPath() {
  var locale = localeFromPath(location.pathname);
  if (locale) {
    writeLocale(locale);
  }
}

export function rememberLocaleNavState() {
  try {
    sessionStorage.setItem(
      LOCALE_NAV_KEY,
      JSON.stringify(captureScrollState()),
    );
  } catch {
    /* ignore */
  }
}
