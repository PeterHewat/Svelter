import { wireDetailsMenus } from "./locale-links";
import { createSectionHashSync, wireHomepageScrollSpy } from "./nav-scroll-spy";
import { HEADER_OFFSET } from "./constants";
import { markHashIntent } from "./hash-intent";
import {
  NAV_HOME_HIGHLIGHT,
  createNavHighlightPersistence,
} from "@repo/utils/nav-highlight";
import {
  animateNavIndicatorBetween,
  animateNavIndicatorFromHome,
  dismissNavIndicatorToHome,
  positionNavIndicator,
  subscribeNavIndicator,
} from "@repo/utils/nav-indicator";

const NAV_HIGHLIGHT_KEY = "marketing-nav-highlight";
const highlight = createNavHighlightPersistence(NAV_HIGHLIGHT_KEY);

function linkStorageKey(link) {
  const section = link.getAttribute("data-nav-section");
  if (section) {
    return "section:" + section;
  }
  const path = link.getAttribute("data-nav-path");
  if (path) {
    return "path:" + path;
  }
  return null;
}

function linkForStorageKey(key, links, activeLinkForSection) {
  if (!key) {
    return null;
  }
  if (key === NAV_HOME_HIGHLIGHT) {
    return document.querySelector("header nav [data-site-home-link]");
  }
  const colon = key.indexOf(":");
  if (colon === -1) {
    return null;
  }
  const kind = key.slice(0, colon);
  const value = key.slice(colon + 1);
  if (kind === "section") {
    return activeLinkForSection(value);
  }
  if (kind === "path") {
    return links.find(function (link) {
      return link.getAttribute("data-nav-path") === value;
    });
  }
  return null;
}

function persistActiveLink(link) {
  const key = linkStorageKey(link);
  if (key) {
    highlight.persist(key);
  }
}

function readPersistedLink(links, activeLinkForSection) {
  return linkForStorageKey(highlight.read(), links, activeLinkForSection);
}

function applyActiveLinkState(links, nextLink) {
  links.forEach(function (link) {
    if (link === nextLink) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function wirePathLinkPersistence(links, getActiveLink) {
  links.forEach(function (link) {
    if (!link.getAttribute("data-nav-path")) {
      return;
    }
    link.addEventListener("click", function () {
      const current = getActiveLink();
      if (current && current !== link) {
        persistActiveLink(current);
      } else if (!current) {
        highlight.persistHome();
      }
    });
  });
}

/**
 * Highlights header nav links for the current page path or homepage section.
 */
export function wireNavActive() {
  wireDetailsMenus("[data-nav-menu]");

  const track = document.querySelector<HTMLElement>("[data-nav-links]");
  const indicator = document.querySelector<HTMLElement>("[data-nav-indicator]");
  const links = Array.from(
    document.querySelectorAll<HTMLElement>("[data-nav-header-link]"),
  );

  if (!track || !indicator || links.length === 0) {
    return;
  }

  const pathname = location.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const isHomepage = segments.length === 1;
  const hashSync = createSectionHashSync(isHomepage);
  let currentSection = null;
  let activeLink = null;
  let entryAnimated = false;
  let dismissing = false;

  function getActiveLink() {
    return activeLink;
  }

  function isDismissing() {
    return dismissing;
  }

  function syncIndicator(options) {
    if (dismissing) {
      return;
    }
    positionNavIndicator(track, activeLink, indicator, options);
  }

  function clearNavHighlight() {
    activeLink = null;
    applyActiveLinkState(links, null);
    highlight.persistHome();
  }

  function dismissToHome(homeEl, onComplete) {
    if (!activeLink) {
      onComplete();
      return;
    }

    const fromLink = activeLink;
    dismissing = true;
    clearNavHighlight();

    dismissNavIndicatorToHome(track, fromLink, homeEl, indicator, {
      onComplete: function () {
        dismissing = false;
        onComplete();
      },
    });
  }

  function headerHomeLink() {
    return document.querySelector("header nav [data-site-home-link]");
  }

  function dismissNavToHome(onComplete) {
    const homeEl = headerHomeLink();
    if (!homeEl || !activeLink) {
      onComplete();
      return;
    }
    dismissToHome(homeEl, onComplete);
  }

  function wireHomeLinks() {
    document.querySelectorAll("[data-site-home-link]").forEach(function (el) {
      el.addEventListener("click", function (event) {
        if (!activeLink) {
          return;
        }

        event.preventDefault();
        const href = el.getAttribute("href");

        dismissToHome(el, function () {
          if (isHomepage) {
            currentSection = null;
            hashSync.clear();
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (href) {
              history.pushState(null, "", href);
            }
            return;
          }

          if (href) {
            window.location.assign(href);
          }
        });
      });
    });
  }

  function clearSectionHighlight() {
    currentSection = null;
    hashSync.clear();
  }

  function setActiveLink(nextLink, options) {
    activeLink = nextLink;
    applyActiveLinkState(links, nextLink);
    syncIndicator(options);
    if (nextLink) {
      persistActiveLink(nextLink);
    }
  }

  function animateIndicatorFromTo(fromLink, toLink) {
    activeLink = toLink;
    applyActiveLinkState(links, toLink);
    animateNavIndicatorBetween(track, fromLink, toLink, indicator);
    persistActiveLink(toLink);
  }

  function animateIndicatorFromHome(homeLink, toLink) {
    activeLink = toLink;
    applyActiveLinkState(links, toLink);
    animateNavIndicatorFromHome(track, homeLink, toLink, indicator);
    persistActiveLink(toLink);
  }

  function isHomeLink(link) {
    return link && link.hasAttribute("data-site-home-link");
  }

  function activeLinkForPath() {
    return links.find(function (link) {
      const pathSegment = link.getAttribute("data-nav-path");
      if (!pathSegment) {
        return false;
      }
      return segments[1] === pathSegment;
    });
  }

  function activeLinkForSection(sectionId) {
    return links.find(function (link) {
      return link.getAttribute("data-nav-section") === sectionId;
    });
  }

  function tryAnimateFromPersistedPath(sectionLink, sectionId, scrollSpy) {
    if (entryAnimated || !sectionLink) {
      return false;
    }

    const previousLink = readPersistedLink(links, activeLinkForSection);
    if (
      !previousLink ||
      previousLink === sectionLink ||
      !previousLink.getAttribute("data-nav-path")
    ) {
      return false;
    }

    entryAnimated = true;
    scrollSpy.markScrollSynced();
    currentSection = sectionId;
    animateIndicatorFromTo(previousLink, sectionLink);
    return true;
  }

  function applySection(sectionId, options, scrollSpy) {
    if (dismissing) {
      return;
    }
    if (sectionId === currentSection) {
      return;
    }

    const link = sectionId ? activeLinkForSection(sectionId) : null;

    if (sectionId && tryAnimateFromPersistedPath(link, sectionId, scrollSpy)) {
      return;
    }

    currentSection = sectionId;
    setActiveLink(link || null, options);
    if (sectionId) {
      if (options && options.userIntent) {
        markHashIntent("#" + sectionId);
        hashSync.update(sectionId);
      }
    } else {
      hashSync.clear();
      if (isHomepage) {
        highlight.persistHome();
      }
    }
  }

  const pathLink = activeLinkForPath();
  if (pathLink) {
    const previousLink = readPersistedLink(links, activeLinkForSection);
    if (previousLink && previousLink !== pathLink) {
      if (isHomeLink(previousLink)) {
        animateIndicatorFromHome(previousLink, pathLink);
      } else {
        animateIndicatorFromTo(previousLink, pathLink);
      }
    } else {
      setActiveLink(pathLink, { instant: true });
    }
  } else if (!isHomepage) {
    setActiveLink(null, undefined);
  } else {
    const scrollSpy = wireHomepageScrollSpy({
      links: links,
      headerOffset: HEADER_OFFSET,
      isDismissing: isDismissing,
      getActiveLink: getActiveLink,
      onApplySection: function (sectionId, options) {
        applySection(sectionId, options, scrollSpy);
      },
      onDismissToHome: dismissNavToHome,
      onClearSection: clearSectionHighlight,
    });
  }

  wireHomeLinks();
  wirePathLinkPersistence(links, getActiveLink);
  subscribeNavIndicator(track, getActiveLink, indicator, { instant: true });
}
