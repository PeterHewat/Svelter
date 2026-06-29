/**
 * Run `fn` after the next layout flush so CSS transitions apply after instant positioning.
 *
 * @param fn - Callback to run once reflow has committed
 */
function flushInstantTransition(fn: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn);
  });
}

/**
 * Positions a sliding underline indicator under the active nav link.
 *
 * @param track - Nav links container (`site-nav-links`)
 * @param activeLink - Currently active link, or `null` to hide
 * @param indicator - Indicator element (`site-nav-indicator`)
 * @param options - `instant` skips the slide animation (e.g. after navigation)
 */
export function positionNavIndicator(
  track: HTMLElement,
  activeLink: HTMLElement | null,
  indicator: HTMLElement,
  options?: { instant?: boolean },
): void {
  if (!activeLink) {
    indicator.classList.remove("is-visible");
    return;
  }

  if (options?.instant) {
    indicator.classList.add("is-instant");
  }

  const trackRect = track.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  const left = linkRect.left - trackRect.left + track.scrollLeft;

  indicator.style.width = `${linkRect.width}px`;
  indicator.style.transform = `translateX(${left}px)`;
  indicator.classList.add("is-visible");

  if (options?.instant) {
    flushInstantTransition(() => {
      indicator.classList.remove("is-instant");
    });
  }
}

/**
 * Slides the indicator toward the home logo and fades it out without underlining the logo.
 *
 * @param track - Nav links container
 * @param fromLink - Currently highlighted nav link
 * @param homeLink - Site logo / home link (`data-site-home-link`)
 * @param indicator - Indicator element
 * @param options - `onComplete` runs after the dismiss animation
 */
export function dismissNavIndicatorToHome(
  track: HTMLElement,
  fromLink: HTMLElement,
  homeLink: HTMLElement,
  indicator: HTMLElement,
  options?: { onComplete?: () => void },
): void {
  let completed = false;

  const finish = () => {
    if (completed) {
      return;
    }
    completed = true;
    indicator.removeEventListener("transitionend", onTransitionEnd);
    indicator.classList.remove("is-visible", "is-dismissing", "is-instant");
    options?.onComplete?.();
  };

  const onTransitionEnd = (event: Event) => {
    const transition = event as TransitionEvent;
    if (transition.target !== indicator) {
      return;
    }
    if (
      transition.propertyName === "transform" ||
      transition.propertyName === "opacity"
    ) {
      finish();
    }
  };

  const trackRect = track.getBoundingClientRect();
  const fromRect = fromLink.getBoundingClientRect();
  const homeRect = homeLink.getBoundingClientRect();
  const fromLeft = fromRect.left - trackRect.left + track.scrollLeft;
  const homeLeft = homeRect.left - trackRect.left + track.scrollLeft;

  indicator.classList.add("is-instant");
  indicator.classList.remove("is-dismissing");
  indicator.style.width = `${fromRect.width}px`;
  indicator.style.transform = `translateX(${fromLeft}px)`;
  indicator.classList.add("is-visible");

  flushInstantTransition(() => {
    indicator.classList.remove("is-instant");
    indicator.classList.add("is-dismissing");
    indicator.style.width = "0px";
    indicator.style.transform = `translateX(${homeLeft}px)`;
    // `transitionend` can be skipped with reduced motion; timeout is the fallback.
    indicator.addEventListener("transitionend", onTransitionEnd);
    window.setTimeout(finish, 300);
  });
}

/**
 * Expands the indicator from the home logo toward a nav link (reverse of dismiss).
 *
 * @param track - Nav links container
 * @param homeLink - Site logo / home link (`data-site-home-link`)
 * @param toLink - Target nav link
 * @param indicator - Indicator element
 */
export function animateNavIndicatorFromHome(
  track: HTMLElement,
  homeLink: HTMLElement,
  toLink: HTMLElement,
  indicator: HTMLElement,
): void {
  const trackRect = track.getBoundingClientRect();
  const homeRect = homeLink.getBoundingClientRect();
  const homeLeft = homeRect.left - trackRect.left + track.scrollLeft;

  indicator.classList.add("is-instant");
  indicator.classList.remove("is-dismissing");
  indicator.style.width = "0px";
  indicator.style.transform = `translateX(${homeLeft}px)`;
  indicator.classList.add("is-visible");

  flushInstantTransition(() => {
    indicator.classList.remove("is-instant");
    positionNavIndicator(track, toLink, indicator);
  });
}

/**
 * Slides the indicator from one nav link to another.
 *
 * @param track - Nav links container
 * @param fromLink - Origin nav link
 * @param toLink - Target nav link
 * @param indicator - Indicator element
 */
export function animateNavIndicatorBetween(
  track: HTMLElement,
  fromLink: HTMLElement,
  toLink: HTMLElement,
  indicator: HTMLElement,
): void {
  positionNavIndicator(track, fromLink, indicator, { instant: true });
  flushInstantTransition(() => {
    positionNavIndicator(track, toLink, indicator);
  });
}

/**
 * Subscribes to resize events and repositions the nav indicator.
 *
 * @param track - Nav links container
 * @param getActiveLink - Returns the active link element
 * @param indicator - Indicator element
 * @returns Cleanup function
 */
export function subscribeNavIndicator(
  track: HTMLElement,
  getActiveLink: () => HTMLElement | null,
  indicator: HTMLElement,
  options?: { instant?: boolean },
): () => void {
  const update = () =>
    positionNavIndicator(track, getActiveLink(), indicator, {
      instant: options?.instant,
    });

  window.addEventListener("resize", update);
  return () => window.removeEventListener("resize", update);
}
