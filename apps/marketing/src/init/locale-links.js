import {
  localeFromPath,
  rememberLocaleNavState,
  writeLocale,
} from "./locale.js";

export function wireLocaleLinks() {
  document.querySelectorAll("[data-locale-link]").forEach(function (el) {
    el.addEventListener("click", function (event) {
      var href = el.getAttribute("href") || "";
      var locale = localeFromPath(href);
      if (!locale) {
        return;
      }

      writeLocale(locale);

      var target = href;
      if (location.hash && target.indexOf("#") === -1) {
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
