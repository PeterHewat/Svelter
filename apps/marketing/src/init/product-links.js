import { isSupportedLocale, localeFromPath } from "./locale.js";
import { readThemeMode, resolveTheme } from "./theme.js";

function readProductAppOrigin() {
  var meta = document.querySelector('meta[name="product-app-origin"]');
  if (meta) {
    var baked = meta.getAttribute("content");
    if (baked) {
      return baked.replace(/\/$/, "");
    }
  }
  return resolveSiblingProductOrigin();
}

/**
 * Keep in sync with resolveProductSiteOrigin in @repo/config/cross-app-origin.
 */
function resolveSiblingProductOrigin() {
  var port = location.port;
  if (port !== "" && port !== "443" && port !== "80") {
    var siblingPort = parseInt(port, 10) - 1;
    return location.protocol + "//" + location.hostname + ":" + siblingPort;
  }
  if (
    location.hostname.endsWith(".pages.dev") &&
    location.hostname.indexOf("-marketing.") !== -1
  ) {
    return (
      location.protocol +
      "//" +
      location.hostname.replace("-marketing.", "-web.")
    );
  }
  return null;
}

export function syncProductAppLinks() {
  var productOrigin = readProductAppOrigin();
  if (!productOrigin) {
    return;
  }
  var pageLocale = localeFromPath(location.pathname);
  var theme = resolveTheme(readThemeMode());

  document.querySelectorAll("[data-product-app-link]").forEach(function (el) {
    var lang = el.getAttribute("data-lang") || pageLocale;
    try {
      var url = new URL("/", productOrigin);
      if (lang && isSupportedLocale(lang)) {
        url.searchParams.set("lang", lang);
      }
      url.searchParams.set("theme", theme);
      if (el.getAttribute("data-auth") === "login") {
        url.searchParams.set("auth", "login");
      }
      el.setAttribute("href", url.toString());
    } catch {
      /* ignore */
    }
  });
}
