/**
 * Marketing chrome init (static JS, no Svelte client bundle).
 * - Locale: redirect unlocalized paths; persist preference on link navigation.
 * - Theme: apply stored override classes; CSS handles system preference when unset.
 *
 * Source modules live in src/init/ — bundled to static/init.js at build/dev time (esbuild).
 */
import { wireChrome } from "./chrome";
import {
  applyCrossAppPrefsFromUrl,
  stripCrossAppPrefsFromUrl,
} from "./cross-app";
import { persistLocaleFromPath, redirectUnlocalizedPaths } from "./locale";
import { markHashIntent } from "./hash-intent";
import {
  persistScrollPosition,
  restoreLocaleNavState,
  restorePageScroll,
  stripStaleHashWhenScrollWasTop,
} from "./scroll";
import { initTheme } from "./theme";

document.documentElement.classList.add("js");

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (redirectUnlocalizedPaths()) {
  /* early exit — full navigation */
} else {
  applyCrossAppPrefsFromUrl();
  stripCrossAppPrefsFromUrl();
  stripStaleHashWhenScrollWasTop();
  if (location.hash) {
    markHashIntent(location.hash);
  }
  if (!restoreLocaleNavState()) {
    restorePageScroll();
  }
  initTheme();
  persistLocaleFromPath();
  window.addEventListener("pagehide", persistScrollPosition);
  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY === 0) {
        persistScrollPosition();
      }
    },
    { passive: true },
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireChrome);
  } else {
    wireChrome();
  }
}
