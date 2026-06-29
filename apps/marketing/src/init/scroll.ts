import { HEADER_OFFSET, LOCALE_NAV_KEY, SCROLL_RESTORE_KEY } from "./constants";

export function getMaxScrollY() {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
}

export function getScrollRatio() {
  const maxScroll = getMaxScrollY();
  return maxScroll > 0 ? window.scrollY / maxScroll : 0;
}

export function findActiveSectionAtViewport(sectionEls, scrollY, headerOffset) {
  const viewportLine = scrollY + headerOffset;
  let bestId = null;
  let bestDist = Infinity;

  sectionEls.forEach(function (el) {
    if (!(el instanceof HTMLElement) || !el.id) {
      return;
    }
    const dist = Math.abs(el.offsetTop - viewportLine);
    if (dist < bestDist) {
      bestDist = dist;
      bestId = el.id;
    }
  });

  return bestId;
}

export function findScrollAnchor() {
  const viewportLine = window.scrollY + HEADER_OFFSET;
  const activeId = findActiveSectionAtViewport(
    Array.from(document.querySelectorAll("main [id], main section[id]")).filter(
      function (el) {
        return el instanceof HTMLElement && el.id;
      },
    ),
    window.scrollY,
    HEADER_OFFSET,
  );

  if (!activeId) {
    return null;
  }

  const el = document.getElementById(activeId);
  if (!el) {
    return null;
  }

  return { id: activeId, offset: viewportLine - el.offsetTop };
}

export function captureScrollState() {
  return {
    ratio: getScrollRatio(),
    anchor: findScrollAnchor(),
  };
}

function scrollToRatio(ratio) {
  const maxScroll = getMaxScrollY();
  window.scrollTo(0, Math.round(ratio * maxScroll));
}

function restoreScrollState(data) {
  if (data.anchor && data.anchor.id) {
    const el = document.getElementById(data.anchor.id);
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
  const el = document.getElementById(hash.slice(1));
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

/**
 * Drop a leftover hash when the user left the page scrolled to the top.
 */
export function stripStaleHashWhenScrollWasTop() {
  try {
    const raw = sessionStorage.getItem(SCROLL_RESTORE_KEY);
    if (!raw) {
      return;
    }
    const data = JSON.parse(raw);
    if (
      data &&
      data.path === location.pathname &&
      data.scrollY === 0 &&
      location.hash
    ) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  } catch {
    /* ignore */
  }
}

export function restoreLocaleNavState() {
  try {
    const raw = sessionStorage.getItem(LOCALE_NAV_KEY);
    if (!raw) {
      return false;
    }
    sessionStorage.removeItem(LOCALE_NAV_KEY);
    const data = JSON.parse(raw);
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
    const raw = sessionStorage.getItem(SCROLL_RESTORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (
        data &&
        data.path === location.pathname &&
        typeof data.scrollY === "number"
      ) {
        function restore() {
          window.scrollTo(0, data.scrollY);
          if (data.scrollY === 0 && location.hash) {
            history.replaceState(null, "", location.pathname + location.search);
          }
        }

        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", function () {
            scheduleScrollRestore(restore);
          });
        } else {
          scheduleScrollRestore(restore);
        }
        return;
      }
    }

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
  } catch {
    /* ignore */
  }
}
