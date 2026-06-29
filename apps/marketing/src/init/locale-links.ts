import { localeFromPath, rememberLocaleNavState, writeLocale } from "./locale";
import { hasHashIntent } from "./hash-intent";

export function wireLocaleLinks() {
  document.querySelectorAll("[data-locale-link]").forEach(function (el) {
    el.addEventListener("click", function (event) {
      const href = el.getAttribute("href") || "";
      const locale = localeFromPath(href);
      if (!locale) {
        return;
      }

      writeLocale(locale);

      let target = href;
      if (
        location.hash &&
        hasHashIntent(location.hash) &&
        target.indexOf("#") === -1
      ) {
        target += location.hash;
      }

      if (target === location.pathname + location.search + location.hash) {
        event.preventDefault();
        return;
      }

      rememberLocaleNavState();

      event.preventDefault();
      location.assign(target);
    });
  });
}

export function wireLocaleMenus() {
  wireDetailsMenus("[data-locale-menu]");
}

/**
 * Closes open `<details>` menus when clicking outside or pressing Escape.
 *
 * @param selector - CSS selector for menu `<details>` elements
 */
export function wireDetailsMenus(selector) {
  document.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    document.querySelectorAll(selector + "[open]").forEach(function (details) {
      if (!(details instanceof HTMLDetailsElement)) {
        return;
      }
      if (!details.contains(target as Node)) {
        details.open = false;
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }

    document.querySelectorAll(selector + "[open]").forEach(function (details) {
      if (details instanceof HTMLDetailsElement) {
        details.open = false;
      }
    });
  });
}
