import { scrollToHashTarget } from "./scroll.js";

function normalizeMarketingPath(path) {
  var normalized = path || "/";
  if (
    normalized.length > 1 &&
    normalized.charAt(normalized.length - 1) === "/"
  ) {
    return normalized.slice(0, -1);
  }
  return normalized;
}

function parseSamePageNavHref(href) {
  if (!href) {
    return null;
  }
  try {
    var url = new URL(href, location.href);
    if (
      normalizeMarketingPath(url.pathname) !==
      normalizeMarketingPath(location.pathname)
    ) {
      return null;
    }
    if (!url.hash || url.hash === "#") {
      return { type: "home" };
    }
    return { type: "anchor", sectionId: url.hash.slice(1) };
  } catch {
    return null;
  }
}

function wireNavRevealReplay(replayAllReveals) {
  function scheduleReplay() {
    requestAnimationFrame(function () {
      requestAnimationFrame(replayAllReveals);
    });
  }

  function navigateHome(event) {
    event.preventDefault();
    window.scrollTo(0, 0);
    if (location.hash) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    scheduleReplay();
  }

  function handleSamePageNavClick(event, link) {
    var nav = parseSamePageNavHref(link.getAttribute("href") || "");
    if (!nav) {
      return;
    }

    if (nav.type === "home") {
      navigateHome(event);
      return;
    }

    var hash = "#" + nav.sectionId;
    var isSameHash = location.hash === hash;

    if (isSameHash) {
      event.preventDefault();
      scrollToHashTarget(hash);
      scheduleReplay();
      return;
    }

    window.addEventListener(
      "hashchange",
      function () {
        scheduleReplay();
      },
      { once: true },
    );
  }

  function wireNavContainer(container) {
    if (!container) {
      return;
    }
    container.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      var link = target.closest("a[href]");
      if (!link || !container.contains(link)) {
        return;
      }
      if (link.hasAttribute("data-product-app-link")) {
        return;
      }
      if (link.getAttribute("target") === "_blank") {
        return;
      }
      handleSamePageNavClick(event, link);
    });
  }

  wireNavContainer(document.querySelector("header"));
  wireNavContainer(document.querySelector("footer"));
}

export function wireRevealInView() {
  var nodes = document.querySelectorAll("[data-reveal]");
  if (!nodes.length) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  function applyRevealVisible(el) {
    var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
    if (delay > 0) {
      window.setTimeout(function () {
        el.classList.add("is-visible");
      }, delay);
    } else {
      el.classList.add("is-visible");
    }
  }

  function isRevealCandidate(el) {
    var rect = el.getBoundingClientRect();
    var margin = window.innerHeight * 0.06;
    return rect.top < window.innerHeight - margin && rect.bottom > 0;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        applyRevealVisible(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
  );

  function observeRevealElements(elements) {
    elements.forEach(function (el) {
      if (isRevealCandidate(el)) {
        applyRevealVisible(el);
        return;
      }
      observer.observe(el);
    });
  }

  function resetRevealElements(elements) {
    elements.forEach(function (el) {
      el.classList.remove("is-visible");
      observer.unobserve(el);
    });
  }

  function replayAllReveals() {
    var allNodes = document.querySelectorAll("[data-reveal]");
    if (!allNodes.length) {
      return;
    }
    resetRevealElements(allNodes);
    observeRevealElements(allNodes);
  }

  observeRevealElements(nodes);
  wireNavRevealReplay(replayAllReveals);
}
