export function wireTestimonialCarousel() {
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

    resetAttribution(item);
    setQuoteGhost(quote);
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
