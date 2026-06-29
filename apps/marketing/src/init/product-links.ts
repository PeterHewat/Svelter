import { isSupportedLocale, localeFromPath } from "./locale";
import { readThemeMode, resolveTheme } from "./theme";

function readProductAppOrigin() {
  const meta = document.querySelector('meta[name="product-app-origin"]');
  if (meta) {
    const baked = meta.getAttribute("content");
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
  const port = location.port;
  if (port !== "" && port !== "443" && port !== "80") {
    const siblingPort = parseInt(port, 10) - 1;
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
  const productOrigin = readProductAppOrigin();
  if (!productOrigin) {
    return;
  }
  const pageLocale = localeFromPath(location.pathname);
  const theme = resolveTheme(readThemeMode());

  document.querySelectorAll("[data-product-app-link]").forEach(function (el) {
    const lang = el.getAttribute("data-lang") || pageLocale;
    try {
      const url = new URL("/", productOrigin);
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
