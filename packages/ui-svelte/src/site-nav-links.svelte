<script lang="ts">
  import {
    animateNavIndicatorBetween,
    animateNavIndicatorFromHome,
    cn,
    dismissNavIndicatorToHome,
    positionNavIndicator,
    subscribeNavIndicator,
  } from "@repo/utils";
  import { createNavHighlightPersistence } from "@repo/utils/nav-highlight";
  import {
    siteNavIndicatorClass,
    siteNavLinkClass,
    siteNavLinksClass,
  } from "@repo/utils/chrome";

  export type SiteNavLink = {
    href: string;
    label: string;
    active?: boolean;
  };

  interface Props {
    links: SiteNavLink[];
    class?: string;
    homeLink?: HTMLElement | null;
    onNavigateHome?: (href: string) => void | Promise<void>;
  }

  let { links, class: className, homeLink, onNavigateHome }: Props = $props();

  const highlight = createNavHighlightPersistence("site-nav-highlight");

  let track = $state<HTMLElement | null>(null);
  let indicator = $state<HTMLElement | null>(null);
  let indicatorReady = $state(false);
  let dismissing = $state(false);
  let lastActiveEl = $state<HTMLElement | null>(null);

  function activeLinkEl(): HTMLElement | null {
    if (!track) return null;
    return track.querySelector<HTMLElement>('[aria-current="page"]');
  }

  function persistActiveHighlight(link: HTMLElement) {
    highlight.persist(link.getAttribute("href") ?? "");
  }

  function syncToActive(
    options: {
      instant?: boolean;
      from?: HTMLElement | null;
      fromHome?: boolean;
    } = {},
  ) {
    if (!track || !indicator) return;

    const nextEl = activeLinkEl();

    if (options.fromHome && homeLink && nextEl) {
      animateNavIndicatorFromHome(track, homeLink, nextEl, indicator);
      persistActiveHighlight(nextEl);
      return;
    }

    if (options.from && nextEl && options.from !== nextEl) {
      animateNavIndicatorBetween(track, options.from, nextEl, indicator);
      persistActiveHighlight(nextEl);
      return;
    }

    positionNavIndicator(track, nextEl, indicator, {
      instant: options.instant,
    });

    if (nextEl) {
      persistActiveHighlight(nextEl);
    } else {
      highlight.persistHome();
    }
  }

  function clearActiveLinkState() {
    if (!track) return;
    track.querySelectorAll("a").forEach((link) => {
      link.removeAttribute("aria-current");
    });
  }

  $effect(() => {
    for (const link of links) {
      void link.active;
    }

    if (dismissing || !track || !indicator) return;

    const nextEl = activeLinkEl();
    if (nextEl === lastActiveEl) return;

    const prevEl = lastActiveEl;
    lastActiveEl = nextEl;

    if (!nextEl) {
      positionNavIndicator(track, null, indicator);
      highlight.persistHome();
      return;
    }

    const isInitial = !indicatorReady;
    indicatorReady = true;

    if (isInitial) {
      if (highlight.isHome(highlight.read()) && homeLink) {
        syncToActive({ fromHome: true });
      } else {
        syncToActive({ instant: true });
      }
      return;
    }

    if (!prevEl && homeLink) {
      syncToActive({ fromHome: true });
      return;
    }

    if (prevEl) {
      syncToActive({ from: prevEl });
      return;
    }

    syncToActive();
  });

  $effect(() => {
    const currentTrack = track;
    const currentIndicator = indicator;
    const currentHome = homeLink;
    if (!currentTrack || !currentIndicator) return;

    const unsubscribeResize = subscribeNavIndicator(
      currentTrack,
      activeLinkEl,
      currentIndicator,
      { instant: true },
    );

    function onNavClick() {
      const active = activeLinkEl();
      if (active) {
        persistActiveHighlight(active);
      } else {
        highlight.persistHome();
      }
    }

    const anchors = currentTrack.querySelectorAll("a");
    anchors.forEach((anchor) => anchor.addEventListener("click", onNavClick));

    function onHomeClick(event: MouseEvent) {
      const active = activeLinkEl();
      if (!active) return;

      event.preventDefault();
      const href = currentHome?.getAttribute("href") ?? "/";
      clearActiveLinkState();
      dismissing = true;

      dismissNavIndicatorToHome(
        currentTrack,
        active,
        currentHome!,
        currentIndicator,
        {
          onComplete: () => {
            dismissing = false;
            lastActiveEl = null;
            highlight.persistHome();
            if (onNavigateHome) {
              void onNavigateHome(href);
            } else {
              window.location.assign(href);
            }
          },
        },
      );
    }

    currentHome?.addEventListener("click", onHomeClick);

    return () => {
      unsubscribeResize();
      anchors.forEach((anchor) =>
        anchor.removeEventListener("click", onNavClick),
      );
      currentHome?.removeEventListener("click", onHomeClick);
    };
  });
</script>

<div class={cn(siteNavLinksClass, className)} bind:this={track} data-nav-links>
  {#each links as link (link.href)}
    <a
      href={link.href}
      class={cn(siteNavLinkClass, link.active && "text-foreground")}
      aria-current={link.active ? "page" : undefined}
    >
      {link.label}
    </a>
  {/each}
  <span class={siteNavIndicatorClass} bind:this={indicator} aria-hidden="true"
  ></span>
</div>
