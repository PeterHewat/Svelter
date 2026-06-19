import { beforeEach, describe, expect, it } from "vitest";
import {
  appendCrossAppPrefs,
  applyCrossAppPrefsFromUrl,
  readStoredLocale,
  readResolvedCrossAppTheme,
  readStoredThemeMode,
  stripCrossAppPrefsFromSearchParams,
  urlWithoutCrossAppPrefs,
} from "./cross-app-prefs";
import { useI18nStore } from "./i18n";
import { clearPersistedStorage, getLocalStorageOrMemory } from "./storage";
import { useThemeStore } from "./theme";

describe("cross-app-prefs", () => {
  beforeEach(() => {
    clearPersistedStorage();
    useI18nStore.setState({ locale: "en" });
    useThemeStore.setState({ mode: "system", resolvedTheme: "light" });
  });

  it("reads stored zustand-shaped prefs", () => {
    getLocalStorageOrMemory().setItem(
      "i18n",
      JSON.stringify({ state: { locale: "fr" }, version: 0 }),
    );
    getLocalStorageOrMemory().setItem(
      "theme",
      JSON.stringify({ state: { mode: "dark" }, version: 0 }),
    );

    expect(readStoredLocale()).toBe("fr");
    expect(readStoredThemeMode()).toBe("dark");
  });

  it("appends lang and theme query params", () => {
    const url = new URL("https://app.example.com/");
    appendCrossAppPrefs(url, { lang: "de", theme: "light" });
    expect(url.searchParams.get("lang")).toBe("de");
    expect(url.searchParams.get("theme")).toBe("light");
  });

  it("applies query params to stores", () => {
    applyCrossAppPrefsFromUrl(new URLSearchParams("lang=es&theme=dark"));
    expect(useI18nStore.getState().locale).toBe("es");
    expect(useThemeStore.getState().mode).toBe("dark");
  });

  it("resolves system theme for cross-app URLs", () => {
    getLocalStorageOrMemory().setItem(
      "theme",
      JSON.stringify({ state: { mode: "system" }, version: 0 }),
    );
    expect(readResolvedCrossAppTheme()).toBe("light");
  });

  it("strips cross-app pref params from search params", () => {
    const params = new URLSearchParams("lang=fr&theme=dark&auth=login");
    expect(stripCrossAppPrefsFromSearchParams(params)).toBe(true);
    expect(params.get("lang")).toBeNull();
    expect(params.get("theme")).toBeNull();
    expect(params.get("auth")).toBe("login");
  });

  it("returns null when url has no cross-app pref params", () => {
    expect(
      urlWithoutCrossAppPrefs(new URL("https://app.example.com/tasks")),
    ).toBeNull();
  });

  it("builds a clean url without cross-app pref params", () => {
    expect(
      urlWithoutCrossAppPrefs(
        new URL("https://app.example.com/?lang=fr&theme=dark#tasks"),
      ),
    ).toBe("/#tasks");
    expect(
      urlWithoutCrossAppPrefs(
        new URL("https://app.example.com/?lang=fr&auth=login"),
      ),
    ).toBe("/?auth=login");
  });
});
