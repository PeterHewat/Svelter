import {
  HEADER_OFFSET,
  LOCALE_NAV_KEY,
  SCROLL_RESTORE_KEY,
} from "./constants.js";

export function getMaxScrollY() {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
}

export function getScrollRatio() {
  var maxScroll = getMaxScrollY();
  return maxScroll > 0 ? window.scrollY / maxScroll : 0;
}

export function findScrollAnchor() {
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

export function captureScrollState() {
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

export function scheduleScrollRestore(restore) {
  restore();
  requestAnimationFrame(restore);
  requestAnimationFrame(function () {
    requestAnimationFrame(restore);
  });
  window.addEventListener("load", restore, { once: true });
}

export function scrollToHashTarget(hash) {
  if (!hash || hash.charAt(0) !== "#") {
    return false;
  }
  var el = document.getElementById(hash.slice(1));
  if (!el) {
    return false;
  }
  window.scrollTo(0, el.offsetTop - HEADER_OFFSET);
  return true;
}

export function persistScrollPosition() {
  try {
    sessionStorage.setItem(
      SCROLL_RESTORE_KEY,
      JSON.stringify({
        path: location.pathname,
        scrollY: window.scrollY,
      }),
    );
  } catch {
    /* ignore */
  }
}

function clearStaleHashIfNeeded(scrollY) {
  if (!location.hash || typeof scrollY !== "number") {
    return;
  }
  var el = document.getElementById(location.hash.slice(1));
  if (!el) {
    return;
  }
  var hashTop = el.offsetTop - HEADER_OFFSET;
  if (Math.abs(scrollY - hashTop) > 80) {
    history.replaceState(null, "", location.pathname + location.search);
  }
}

export function restoreLocaleNavState() {
  try {
    var raw = sessionStorage.getItem(LOCALE_NAV_KEY);
    if (!raw) {
      return false;
    }
    sessionStorage.removeItem(LOCALE_NAV_KEY);
    var data = JSON.parse(raw);
    if (
      !data ||
      (typeof data.ratio !== "number" &&
        typeof data.scrollY !== "number" &&
        !data.anchor)
    ) {
      return false;
    }

    function restore() {
      restoreScrollState(data);
    }

    function scheduleRestore() {
      scheduleScrollRestore(restore);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", scheduleRestore, {
        once: true,
      });
    } else {
      scheduleRestore();
    }

    return true;
  } catch {
    return false;
  }
}

export function restorePageScroll() {
  try {
    var raw = sessionStorage.getItem(SCROLL_RESTORE_KEY);
    if (!raw) {
      if (location.hash) {
        function restoreHash() {
          scrollToHashTarget(location.hash);
        }
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", function () {
            scheduleScrollRestore(restoreHash);
          });
        } else {
          scheduleScrollRestore(restoreHash);
        }
      }
      return;
    }

    var data = JSON.parse(raw);
    if (!data || data.path !== location.pathname) {
      return;
    }

    function restore() {
      if (typeof data.scrollY === "number") {
        window.scrollTo(0, data.scrollY);
        clearStaleHashIfNeeded(data.scrollY);
        return;
      }
      if (data.hash && scrollToHashTarget(data.hash)) {
        return;
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        scheduleScrollRestore(restore);
      });
    } else {
      scheduleScrollRestore(restore);
    }
  } catch {
    /* ignore */
  }
}
