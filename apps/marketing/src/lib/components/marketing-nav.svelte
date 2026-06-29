<script lang="ts">
  import { cn } from "@repo/utils";
  import {
    iconButtonClass,
    iconSlotClass,
    languageSwitcherDetailsClass,
    languageSwitcherIconOnlyClass,
    languageSwitcherIconOnlySummaryClass,
    languageSwitcherMenuCheckSlotClass,
    languageSwitcherMenuClass,
    languageSwitcherMenuLinkClass,
    languageSwitcherSizes,
    languageSwitcherSummaryClass,
    siteHeaderClass,
    siteNavIndicatorClass,
    siteNavLinkClass,
    siteNavLinksClass,
  } from "@repo/utils/chrome";
  import { SiteLogo } from "@repo/ui-svelte";
  import ProductAppLink from "$lib/components/product-app-link.svelte";
  import { MARKETING_LOCALES, SUPPORTED_LOCALES } from "$lib/i18n";
  import { useMarketingLang, useMarketingT } from "$lib/marketing-context";
  import { headerNavLinks } from "$lib/marketing-nav-links";
  import { localizedPath, switchLocalePath } from "$lib/locale-path";
  import { SITE_NAME } from "$lib/site";

  interface Props {
    pathname: string;
  }

  let { pathname }: Props = $props();

  const t = useMarketingT();
  const lang = useMarketingLang();
  const homeHref = $derived(localizedPath(lang));
  const navLinks = $derived(
    headerNavLinks.map((link) => ({
      href: link.href(lang),
      label: t(link.labelKey),
      sectionId: link.sectionId,
      pathSegment: link.pathSegment,
    })),
  );

  const primaryCtaClass =
    "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 shrink-0 items-center rounded-lg px-4 text-sm font-medium transition-colors";

  function headerNavLinkAttrs(link: {
    href: string;
    sectionId?: string;
    pathSegment?: string;
  }) {
    const attrs: Record<string, string | undefined> = {
      "data-nav-header-link": "",
      href: link.href,
    };
    if (link.sectionId) {
      attrs["data-nav-section"] = link.sectionId;
    }
    if (link.pathSegment) {
      attrs["data-nav-path"] = link.pathSegment;
    }
    return attrs;
  }
</script>

<header class={siteHeaderClass}>
  <nav
    class="flex w-full items-center gap-2 px-4 py-3 sm:px-6"
    aria-label={t("nav.main")}
  >
    <div class="flex min-w-0 items-center gap-2 sm:gap-3">
      <SiteLogo href={homeHref} name={SITE_NAME} />

      <details
        class={cn(
          languageSwitcherDetailsClass,
          languageSwitcherSizes.md,
          languageSwitcherIconOnlyClass,
          "nav:hidden",
        )}
        data-nav-menu
      >
        <summary
          class={cn(
            languageSwitcherSummaryClass,
            "size-10 shrink-0 items-center justify-center p-0",
          )}
          aria-label={t("nav.menu")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-muted-foreground h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <path d="M4 5h16" />
            <path d="M4 12h16" />
            <path d="M4 19h16" />
          </svg>
        </summary>
        <ul class={languageSwitcherMenuClass} role="list">
          {#each navLinks as link (link.href)}
            <li>
              <a href={link.href} class={languageSwitcherMenuLinkClass}>
                {link.label}
              </a>
            </li>
          {/each}
          <li>
            <ProductAppLink {lang} class={languageSwitcherMenuLinkClass}>
              {t("nav.dashboard")}
            </ProductAppLink>
          </li>
        </ul>
      </details>

      <div class="nav:hidden shrink-0">
        <ProductAppLink {lang} class={cn(primaryCtaClass, "h-10 px-3 text-sm")}>
          {t("nav.dashboard")}
        </ProductAppLink>
      </div>

      <div class={cn("hidden nav:flex", siteNavLinksClass)} data-nav-links>
        {#each navLinks as link (link.href)}
          <a {...headerNavLinkAttrs(link)} class={siteNavLinkClass}>
            {link.label}
          </a>
        {/each}
        <span
          class={siteNavIndicatorClass}
          data-nav-indicator
          aria-hidden="true"
        ></span>
      </div>
    </div>

    <div class="hidden grow justify-center nav:flex">
      <ProductAppLink {lang} class={primaryCtaClass}>
        {t("nav.dashboard")}
      </ProductAppLink>
    </div>

    <div class="ml-auto flex shrink-0 items-center gap-2">
      <details
        class={cn(
          languageSwitcherDetailsClass,
          languageSwitcherSizes.md,
          languageSwitcherIconOnlyClass,
        )}
        data-locale-menu
      >
        <summary
          class={languageSwitcherIconOnlySummaryClass}
          aria-label={t("language.select")}
          title={t("language.select")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-muted-foreground h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        </summary>
        <ul class={languageSwitcherMenuClass} role="list">
          {#each MARKETING_LOCALES as locale (locale)}
            <li>
              <a
                href={switchLocalePath(pathname, locale)}
                class={languageSwitcherMenuLinkClass}
                hreflang={locale}
                lang={locale}
                aria-current={locale === lang ? "page" : undefined}
                data-locale-link
              >
                <span
                  class={languageSwitcherMenuCheckSlotClass}
                  aria-hidden="true"
                >
                  {#if locale === lang}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="h-4 w-4"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  {/if}
                </span>
                {SUPPORTED_LOCALES[locale]}
              </a>
            </li>
          {/each}
        </ul>
      </details>

      <button
        type="button"
        class={iconButtonClass()}
        data-theme-toggle
        disabled
        data-title-light={t("theme.switchToLight")}
        data-title-dark={t("theme.switchToDark")}
        data-aria-label-light={t("theme.switchToLightAria")}
        data-aria-label-dark={t("theme.switchToDarkAria")}
        aria-label={t("theme.toggle")}
        title={t("theme.toggle")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-muted-foreground h-5 w-5 shrink-0"
          aria-hidden="true"
          data-theme-toggle-icon
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          />
        </svg>
      </button>

      <div class={iconSlotClass}>
        <ProductAppLink
          {lang}
          class={iconButtonClass()}
          aria-label={t("nav.signIn")}
          title={t("nav.signIn")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-muted-foreground h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" x2="3" y1="12" y2="12" />
          </svg>
        </ProductAppLink>
      </div>
    </div>
  </nav>
</header>
