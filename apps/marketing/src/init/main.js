/**
 * Marketing chrome init (static JS, no Svelte client bundle).
 * - Locale: redirect unlocalized paths; persist preference on link navigation.
 * - Theme: apply stored override classes; CSS handles system preference when unset.
 *
 * Source modules live in src/init/ — bundled to static/init.js at build/dev time.
 */
import { wireChrome } from "./chrome.js";
import {
  applyCrossAppPrefsFromUrl,
  stripCrossAppPrefsFromUrl,
} from "./cross-app.js";
import { persistLocaleFromPath, redirectUnlocalizedPaths } from "./locale.js";
import {
  persistScrollPosition,
  restoreLocaleNavState,
  restorePageScroll,
} from "./scroll.js";
import { initTheme } from "./theme.js";

document.documentElement.classList.add("js");

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (redirectUnlocalizedPaths()) {
  /* early exit — full navigation */
} else {
  applyCrossAppPrefsFromUrl();
  stripCrossAppPrefsFromUrl();
  if (!restoreLocaleNavState()) {
    restorePageScroll();
  }
  initTheme();
  persistLocaleFromPath();
  window.addEventListener("pagehide", persistScrollPosition);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireChrome);
  } else {
    wireChrome();
  }
}
