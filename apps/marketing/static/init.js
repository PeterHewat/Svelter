/**
 * Marketing chrome init (static JS, no Svelte client bundle).
 * - Locale: redirect unlocalized paths; persist preference on link navigation.
 * - Theme: apply stored override classes; CSS handles system preference when unset.
 */
(function () {
  var THEME_KEY = "theme";
  var I18N_KEY = "i18n";
  var SUPPORTED_LOCALES = {
    en: true,
    es: true,
    fr: true,
    de: true,
    pt: true,
    it: true,
    nl: true,
    pl: true,
    ru: true,
  };

  function localeFromPath(path) {
    var match = /^\/([a-z]{2})(?:\/|$)/.exec(path);
    if (match && SUPPORTED_LOCALES[match[1]]) {
      return match[1];
    }
    return null;
  }

  function readStoredLocale() {
    try {
      var raw = localStorage.getItem(I18N_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (
          parsed &&
          parsed.state &&
          parsed.state.locale &&
          SUPPORTED_LOCALES[parsed.state.locale]
        ) {
          return parsed.state.locale;
        }
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  function writeLocale(locale) {
    localStorage.setItem(
      I18N_KEY,
      JSON.stringify({ state: { locale: locale }, version: 0 }),
    );
  }

  function getBrowserLocale() {
    var lang = (navigator.language || "").split("-")[0];
    return SUPPORTED_LOCALES[lang] ? lang : "en";
  }

  function resolvePreferredLocale() {
    return readStoredLocale() || getBrowserLocale();
  }

  function redirectUnlocalizedPaths() {
    var path = location.pathname.replace(/\/$/, "") || "/";
    var locale = resolvePreferredLocale();

    if (path === "/") {
      location.replace("/" + locale + "/");
      return true;
    }

    if (path === "/blog") {
      location.replace("/" + locale + "/blog");
      return true;
    }

    var blogPost = /^\/blog\/([^/]+)$/.exec(path);
    if (blogPost) {
      location.replace("/" + locale + "/blog/" + blogPost[1]);
      return true;
    }

    return false;
  }

  function readThemeMode() {
    try {
      var raw = localStorage.getItem(THEME_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.state && parsed.state.mode) {
          return parsed.state.mode;
        }
      }
    } catch {
      /* ignore */
    }
    return "system";
  }

  function resolveTheme(mode) {
    if (mode === "dark") return "dark";
    if (mode === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyThemeFromMode(mode) {
    var root = document.documentElement;
    root.classList.remove("dark", "light");
    if (mode === "dark") {
      root.classList.add("dark");
    } else if (mode === "light") {
      root.classList.add("light");
    }
  }

  function writeThemeMode(mode) {
    localStorage.setItem(
      THEME_KEY,
      JSON.stringify({ state: { mode: mode }, version: 0 }),
    );
  }

  function enableThemeTransition() {
    document.documentElement.classList.add("theme-transition");
  }

  function initTheme() {
    applyThemeFromMode(readThemeMode());
  }

  function toggleTheme() {
    enableThemeTransition();
    var resolved = resolveTheme(readThemeMode());
    var next = resolved === "dark" ? "light" : "dark";
    writeThemeMode(next);
    applyThemeFromMode(next);
    updateToggleLabels();
  }

  function updateToggleLabels() {
    var resolved = resolveTheme(readThemeMode());
    var next = resolved === "dark" ? "light" : "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
      var label = el.getAttribute("data-label-" + next) || next;
      el.setAttribute("aria-label", label);
      el.setAttribute("title", label);
      var icon = el.querySelector("[data-theme-toggle-icon]");
      if (icon) {
        icon.innerHTML =
          next === "light"
            ? '<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />'
            : '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />';
      }
    });
  }

  function persistLocaleFromPath() {
    var locale = localeFromPath(location.pathname);
    if (locale) {
      writeLocale(locale);
    }
  }

  if (redirectUnlocalizedPaths()) {
    return;
  }

  initTheme();
  persistLocaleFromPath();

  function wireLocaleLinks() {
    document.querySelectorAll("[data-locale-link]").forEach(function (el) {
      el.addEventListener("click", function () {
        var href = el.getAttribute("href") || "";
        var locale = localeFromPath(href);
        if (locale) {
          writeLocale(locale);
        }
      });
    });
  }

  function wireLocaleMenus() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      document
        .querySelectorAll("[data-locale-menu][open]")
        .forEach(function (details) {
          if (!details.contains(target)) {
            details.open = false;
          }
        });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") {
        return;
      }

      document
        .querySelectorAll("[data-locale-menu][open]")
        .forEach(function (details) {
          details.open = false;
        });
    });
  }

  function wireChrome() {
    updateToggleLabels();
    document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
      el.addEventListener("click", toggleTheme);
    });
    wireLocaleLinks();
    wireLocaleMenus();
    requestAnimationFrame(enableThemeTransition);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireChrome);
  } else {
    wireChrome();
  }
})();
