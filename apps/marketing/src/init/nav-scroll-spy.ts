import { findActiveSectionAtViewport } from "./scroll";

/**
 * Hash helpers for homepage section deep links.
 *
 * @param isHomepage - Whether the current path is a locale homepage
 */
export function createSectionHashSync(isHomepage) {
  return {
    update(sectionId) {
      if (!sectionId || !isHomepage) {
        return;
      }
      const nextHash = "#" + sectionId;
      if (location.hash === nextHash) {
        return;
      }
      history.replaceState(
        null,
        "",
        location.pathname + location.search + nextHash,
      );
    },
    clear() {
      if (!location.hash) {
        return;
      }
      history.replaceState(null, "", location.pathname + location.search);
    },
  };
}

/**
 * Scroll-spy, section link clicks, and mobile nav menu close for the homepage.
 *
 * @param options - Wiring callbacks and DOM context
 */
export function wireHomepageScrollSpy(options) {
  const links = options.links;
  const headerOffset = options.headerOffset;
  const isDismissing = options.isDismissing;
  const getActiveLink = options.getActiveLink;
  const onApplySection = options.onApplySection;
  const onDismissToHome = options.onDismissToHome;
  const onClearSection = options.onClearSection;

  const sectionIds = links
    .map(function (link) {
      return link.getAttribute("data-nav-section");
    })
    .filter(Boolean);

  const sections = sectionIds
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  if (sections.length === 0) {
    return { scrollSynced: false };
  }

  let scrollTicking = false;
  let scrollSynced = false;

  function syncFromScroll() {
    if (isDismissing()) {
      return;
    }
    if (window.scrollY < headerOffset) {
      if (getActiveLink()) {
        onDismissToHome(onClearSection);
        return;
      }
      onApplySection(null);
      return;
    }

    const activeId = findActiveSectionAtViewport(
      sections,
      window.scrollY,
      headerOffset,
    );
    if (activeId) {
      onApplySection(activeId, { instant: !scrollSynced });
      scrollSynced = true;
    }
  }

  function scheduleScrollSync() {
    if (scrollTicking) {
      return;
    }
    scrollTicking = true;
    requestAnimationFrame(function () {
      scrollTicking = false;
      syncFromScroll();
    });
  }

  window.addEventListener("scroll", scheduleScrollSync, { passive: true });
  window.addEventListener("load", function () {
    scheduleScrollSync();
  });
  scheduleScrollSync();

  links.forEach(function (link) {
    link.addEventListener("click", function () {
      const sectionId = link.getAttribute("data-nav-section");
      if (sectionId) {
        onApplySection(sectionId, { userIntent: true });
      }
    });
  });

  document.querySelectorAll("[data-nav-menu] a").forEach(function (link) {
    link.addEventListener("click", function () {
      const menu = link.closest("[data-nav-menu]");
      if (menu instanceof HTMLDetailsElement) {
        menu.open = false;
      }
    });
  });

  return {
    /** Mark scroll-spy as synced (e.g. after a cross-page entry animation). */
    markScrollSynced() {
      scrollSynced = true;
    },
  };
}
