/**
 * Marketing chrome init (static JS, no Svelte client bundle).
 * - Locale: redirect unlocalized paths; persist preference on link navigation.
 * - Theme: apply stored override classes; CSS handles system preference when unset.
 */
(function () {
  var THEME_KEY = "theme";
  var I18N_KEY = "i18n";
  // Keep in sync with SUPPORTED_LOCALES / MARKETING_LOCALES in src/lib/i18n.ts
  var SUPPORTED_LOCALES = [
    "en",
    "es",
    "fr",
    "de",
    "pt",
    "it",
    "nl",
    "pl",
    "ru",
  ];

  function isSupportedLocale(lang) {
    return SUPPORTED_LOCALES.indexOf(lang) !== -1;
  }

  function localeFromPath(path) {
    var match = /^\/([a-z]{2})(?:\/|$)/.exec(path);
    if (match && isSupportedLocale(match[1])) {
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
          isSupportedLocale(parsed.state.locale)
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
    return isSupportedLocale(lang) ? lang : "en";
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

  var LOCALE_NAV_KEY = "marketing-locale-nav";
  var HEADER_OFFSET = 80;

  function getMaxScrollY() {
    return Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
  }

  function getScrollRatio() {
    var maxScroll = getMaxScrollY();
    return maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  function findScrollAnchor() {
    var viewportLine = window.scrollY + HEADER_OFFSET;
    var bestId = null;
    var bestOffset = 0;
    var bestDist = Infinity;

    document
      .querySelectorAll("main [id], main section[id]")
      .forEach(function (el) {
        if (!(el instanceof HTMLElement) || !el.id) {
          return;
        }
        var top = el.offsetTop;
        var dist = Math.abs(top - viewportLine);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = el.id;
          bestOffset = viewportLine - top;
        }
      });

    if (!bestId) {
      return null;
    }
    return { id: bestId, offset: bestOffset };
  }

  function captureScrollState() {
    return {
      ratio: getScrollRatio(),
      anchor: findScrollAnchor(),
    };
  }

  function scrollToRatio(ratio) {
    var maxScroll = getMaxScrollY();
    window.scrollTo(0, Math.round(ratio * maxScroll));
  }

  function restoreScrollState(data) {
    if (data.anchor && data.anchor.id) {
      var el = document.getElementById(data.anchor.id);
      if (el) {
        window.scrollTo(0, el.offsetTop + data.anchor.offset - HEADER_OFFSET);
        return;
      }
    }
    if (typeof data.ratio === "number") {
      scrollToRatio(data.ratio);
    } else if (typeof data.scrollY === "number") {
      window.scrollTo(0, data.scrollY);
    }
  }

  function persistLocaleFromPath() {
    var locale = localeFromPath(location.pathname);
    if (locale) {
      writeLocale(locale);
    }
  }

  function rememberLocaleNavState() {
    try {
      sessionStorage.setItem(
        LOCALE_NAV_KEY,
        JSON.stringify(captureScrollState()),
      );
    } catch {
      /* ignore */
    }
  }

  function applyCrossAppPrefsFromUrl() {
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

  function stripCrossAppPrefsFromUrl() {
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

  function restoreLocaleNavState() {
    try {
      var raw = sessionStorage.getItem(LOCALE_NAV_KEY);
      if (!raw) {
        return;
      }
      sessionStorage.removeItem(LOCALE_NAV_KEY);
      var data = JSON.parse(raw);
      if (
        !data ||
        (typeof data.ratio !== "number" &&
          typeof data.scrollY !== "number" &&
          !data.anchor)
      ) {
        return;
      }

      function restore() {
        restoreScrollState(data);
      }

      function scheduleRestore() {
        restore();
        requestAnimationFrame(restore);
        requestAnimationFrame(function () {
          requestAnimationFrame(restore);
        });
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", scheduleRestore, {
          once: true,
        });
      } else {
        scheduleRestore();
      }

      window.addEventListener("load", restore, { once: true });
    } catch {
      /* ignore */
    }
  }

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  if (redirectUnlocalizedPaths()) {
    return;
  }

  applyCrossAppPrefsFromUrl();
  stripCrossAppPrefsFromUrl();
  restoreLocaleNavState();
  initTheme();
  persistLocaleFromPath();

  function wireLocaleLinks() {
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

  function wireTestimonialCarousel() {
    var root = document.querySelector("[data-testimonial-carousel]");
    if (!root) {
      return;
    }

    var raw = root.getAttribute("data-testimonials");
    if (!raw) {
      return;
    }

    var items;
    try {
      items = JSON.parse(raw);
    } catch {
      return;
    }

    if (!items || !items.length) {
      return;
    }

    var quoteEl = root.querySelector("[data-testimonial-quote]");
    var ghostEl = root.querySelector("[data-testimonial-quote-ghost]");
    var nameEl = root.querySelector("[data-testimonial-name]");
    var roleEl = root.querySelector("[data-testimonial-role]");
    var attributionEl = root.querySelector(
      "[data-testimonial-attribution-visible]",
    );
    var prevBtn = root.querySelector("[data-testimonial-prev]");
    var nextBtn = root.querySelector("[data-testimonial-next]");
    if (!quoteEl || !nameEl || !roleEl || !attributionEl) {
      return;
    }

    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    var charIntervalMs = 32;
    var pauseMs = 3000;
    var index = 0;
    var typeTimer = null;
    var advanceTimer = null;
    var advanceDueAt = 0;
    var advanceCallback = null;
    var hoverPaused = false;
    var touchPaused = false;

    function clearTypeTimer() {
      if (typeTimer) {
        clearTimeout(typeTimer);
        typeTimer = null;
      }
    }

    function clearAdvanceTimer() {
      if (advanceTimer) {
        clearTimeout(advanceTimer);
        advanceTimer = null;
      }
      advanceCallback = null;
      advanceDueAt = 0;
    }

    function clearTimers() {
      clearTypeTimer();
      clearAdvanceTimer();
    }

    function isInteractionPaused() {
      return hoverPaused || touchPaused;
    }

    function scheduleAdvance(callback, delayMs) {
      clearAdvanceTimer();
      advanceCallback = callback;
      advanceDueAt = Date.now() + delayMs;

      function check() {
        if (!advanceCallback) {
          return;
        }

        if (isInteractionPaused()) {
          advanceTimer = setTimeout(check, 50);
          return;
        }

        var remaining = advanceDueAt - Date.now();
        if (remaining > 0) {
          advanceTimer = setTimeout(check, remaining);
          return;
        }

        var fn = advanceCallback;
        clearAdvanceTimer();
        fn();
      }

      advanceTimer = setTimeout(check, delayMs);
    }

    function resetAttribution(item) {
      attributionEl.classList.remove("is-visible");
      attributionEl.style.animation = "none";
      void attributionEl.offsetWidth;
      attributionEl.style.animation = "";
      nameEl.textContent = item.name;
      roleEl.textContent = item.role;
    }

    function revealAttribution() {
      requestAnimationFrame(function () {
        attributionEl.classList.add("is-visible");
      });
    }

    function setQuoteText(text) {
      quoteEl.textContent = text;
    }

    function setQuoteGhost(quote) {
      if (ghostEl) {
        ghostEl.textContent = "\u201c" + quote + "\u201d";
      }
    }

    function normalizeQuote(text) {
      return text.replace(/[\u201c\u201d"]/g, "").trim();
    }

    function isFirstItemRendered() {
      if (!items[0]) {
        return false;
      }
      return normalizeQuote(quoteEl.textContent || "") === items[0].quote;
    }

    function showInstant(item) {
      setQuoteGhost(item.quote);
      setQuoteText("\u201c" + item.quote + "\u201d");
      resetAttribution(item);
      requestAnimationFrame(function () {
        revealAttribution();
      });
    }

    function advanceTo(nextIndex) {
      index = (nextIndex + items.length) % items.length;
      playItem(index, {});
    }

    function playItem(itemIndex, options) {
      var opts = options || {};
      var item = items[itemIndex];
      if (!item || !item.quote) {
        return;
      }

      index = itemIndex;
      clearTimers();

      if (
        opts.skipIfRendered &&
        itemIndex === 0 &&
        isFirstItemRendered() &&
        !opts.force
      ) {
        showInstant(item);
        if (items.length > 1) {
          scheduleAdvance(function () {
            advanceTo(1);
          }, pauseMs);
        }
        return;
      }

      if (reduceMotion) {
        showInstant(item);
        scheduleAdvance(function () {
          advanceTo(itemIndex + 1);
        }, pauseMs + 3000);
        return;
      }

      var quote = item.quote;
      var length = quote.length;
      var charIndex = 0;
      var attributionShown = false;

      setQuoteGhost(quote);
      resetAttribution(item);
      setQuoteText("\u201c");

      function maybeRevealAttribution() {
        if (attributionShown) {
          return;
        }
        if (charIndex >= 3 || charIndex / length >= 0.12) {
          attributionShown = true;
          revealAttribution();
        }
      }

      function tick() {
        if (charIndex < length) {
          charIndex += 1;
          setQuoteText("\u201c" + quote.slice(0, charIndex));
          maybeRevealAttribution();
          typeTimer = setTimeout(tick, charIntervalMs);
          return;
        }

        setQuoteText("\u201c" + quote + "\u201d");
        revealAttribution();
        scheduleAdvance(function () {
          advanceTo(itemIndex + 1);
        }, pauseMs);
      }

      tick();
    }

    root.addEventListener("mouseenter", function () {
      hoverPaused = true;
    });
    root.addEventListener("mouseleave", function () {
      hoverPaused = false;
    });
    root.addEventListener(
      "pointerdown",
      function (event) {
        if (event.pointerType === "touch") {
          touchPaused = true;
        }
      },
      { passive: true },
    );
    root.addEventListener("pointerup", function (event) {
      if (event.pointerType === "touch") {
        touchPaused = false;
      }
    });
    root.addEventListener("pointercancel", function () {
      touchPaused = false;
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        advanceTo(index - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        advanceTo(index + 1);
      });
    }

    playItem(index, { skipIfRendered: true });
  }

  function readProductAppOrigin() {
    var meta = document.querySelector('meta[name="product-app-origin"]');
    if (!meta) {
      return null;
    }
    var value = meta.getAttribute("content");
    return value ? value.replace(/\/$/, "") : null;
  }

  function syncProductAppLinks() {
    var productOrigin = readProductAppOrigin();
    if (!productOrigin) {
      return;
    }
    var pageLocale = localeFromPath(location.pathname);
    var theme = resolveTheme(readThemeMode());

    document.querySelectorAll("[data-product-app-link]").forEach(function (el) {
      var href = el.getAttribute("href") || "";
      try {
        var url = new URL(href);
        if (url.origin !== productOrigin) {
          return;
        }
        var lang = el.getAttribute("data-lang") || pageLocale;
        if (lang && isSupportedLocale(lang)) {
          url.searchParams.set("lang", lang);
        }
        url.searchParams.set("theme", theme);
        el.setAttribute("href", url.toString());
      } catch {
        /* ignore */
      }
    });
  }

  function wireChrome() {
    updateToggleLabels();
    document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
      el.addEventListener("click", function () {
        toggleTheme();
        syncProductAppLinks();
      });
    });
    wireLocaleLinks();
    wireLocaleMenus();
    wireTestimonialCarousel();
    syncProductAppLinks();
    requestAnimationFrame(enableThemeTransition);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireChrome);
  } else {
    wireChrome();
  }
})();
