import { isSupportedLocale, writeLocale } from "./locale";
import { applyThemeFromMode, writeThemeMode } from "./theme";

export function applyCrossAppPrefsFromUrl() {
  const params = new URLSearchParams(location.search);
  const lang = params.get("lang");
  if (lang && isSupportedLocale(lang)) {
    writeLocale(lang);
  }
  const theme = params.get("theme");
  if (theme === "light" || theme === "dark") {
    writeThemeMode(theme);
    applyThemeFromMode(theme);
  }
}

export function stripCrossAppPrefsFromUrl() {
  const params = new URLSearchParams(location.search);
  if (!params.has("lang") && !params.has("theme")) {
    return;
  }
  params.delete("lang");
  params.delete("theme");
  const search = params.toString();
  const url = location.pathname + (search ? "?" + search : "") + location.hash;
  history.replaceState(null, "", url);
}
