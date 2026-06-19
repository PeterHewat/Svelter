<script lang="ts">
  import { cn } from "@repo/utils";
  import {
    iconButtonClass,
    languageSwitcherDetailsClass,
    languageSwitcherIconOnlyClass,
    languageSwitcherIconOnlySummaryClass,
    languageSwitcherMenuCheckSlotClass,
    languageSwitcherMenuClass,
    languageSwitcherMenuLinkClass,
    languageSwitcherSizes,
    navLinkClass,
    navSecondaryLinkClass,
    siteHeaderClass,
    siteNavClass,
  } from "@repo/utils/chrome";
  import ProductAppLink from "$lib/components/product-app-link.svelte";
  import { MARKETING_LOCALES, SUPPORTED_LOCALES } from "$lib/i18n";
  import { useMarketingLang, useMarketingT } from "$lib/marketing-context";
  import { productNavLinks } from "$lib/marketing-nav-links";
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
    productNavLinks.map((link) => ({
      href: link.href(lang),
      label: t(link.labelKey),
    })),
  );

  const primaryCtaClass =
    "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 shrink-0 items-center rounded-lg px-4 text-sm font-medium transition-colors";
</script>

<header class={siteHeaderClass}>
  <nav class={siteNavClass} aria-label={t("nav.main")}>
    <div class="flex min-w-0 items-center gap-3">
      <a href={homeHref} class={cn("truncate text-lg", navLinkClass)}>
        {SITE_NAME}
      </a>

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
          class={languageSwitcherIconOnlySummaryClass}
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
        </ul>
      </details>

      <div class="hidden items-center gap-4 nav:flex">
        {#each navLinks as link (link.href)}
          <a href={link.href} class={navSecondaryLinkClass}>
            {link.label}
          </a>
        {/each}
      </div>
    </div>

    <div class="flex items-center gap-2">
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
            <path d="m5 8 6 6" />
            <path d="m4 14 6-6 2-3" />
            <path d="M2 5h12" />
            <path d="M7 2h1" />
            <path d="m22 22-5-10-5 10" />
            <path d="M14 18h6" />
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
        data-requires-js
        data-label-light={t("theme.light")}
        data-label-dark={t("theme.dark")}
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
          class="h-5 w-5 shrink-0"
          aria-hidden="true"
          data-theme-toggle-icon
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          />
        </svg>
      </button>

      <ProductAppLink {lang} class={primaryCtaClass}>
        {t("nav.dashboard")}
      </ProductAppLink>
    </div>
  </nav>
</header>
