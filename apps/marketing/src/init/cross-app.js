import { isSupportedLocale, writeLocale } from "./locale.js";
import { applyThemeFromMode, writeThemeMode } from "./theme.js";

export function applyCrossAppPrefsFromUrl() {
  var params = new URLSearchParams(location.search);
  var lang = params.get("lang");
  if (lang && isSupportedLocale(lang)) {
    writeLocale(lang);
  }
  var theme = params.get("theme");
  if (theme === "light" || theme === "dark") {
    writeThemeMode(theme);
    applyThemeFromMode(theme);
  }
}

export function stripCrossAppPrefsFromUrl() {
  var params = new URLSearchParams(location.search);
  if (!params.has("lang") && !params.has("theme")) {
    return;
  }
  params.delete("lang");
  params.delete("theme");
  var search = params.toString();
  var url = location.pathname + (search ? "?" + search : "") + location.hash;
  history.replaceState(null, "", url);
}
