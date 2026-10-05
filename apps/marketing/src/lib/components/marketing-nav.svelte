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
  import {
    CheckIcon,
    I18nIcon,
    MenuIcon,
    SignInIcon,
    SiteLogo,
    SunIcon,
  } from "@repo/ui-svelte";
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
    class="flex h-16 w-full items-center gap-2 px-4 py-0 sm:px-6"
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
          <MenuIcon />
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

      <div class={cn("nav:flex hidden", siteNavLinksClass)} data-nav-links>
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

    <div class="nav:flex hidden grow justify-center">
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
          <I18nIcon />
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
                    <CheckIcon />
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
        <SunIcon themeToggleIcon />
      </button>

      <div class={iconSlotClass}>
        <ProductAppLink
          {lang}
          class={iconButtonClass()}
          aria-label={t("nav.signIn")}
          title={t("nav.signIn")}
        >
          <SignInIcon />
        </ProductAppLink>
      </div>
    </div>
  </nav>
</header>
