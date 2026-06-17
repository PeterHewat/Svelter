<script lang="ts">
  import "../../app.css";
  import { SiteFooter } from "@repo/ui-svelte";
  import { cn } from "@repo/utils";
  import {
    iconButtonClass,
    iconSlotClass,
    languageSwitcherDetailsClass,
    languageSwitcherMenuClass,
    languageSwitcherMenuCheckSlotClass,
    languageSwitcherMenuLinkClass,
    languageSwitcherSizes,
    languageSwitcherSummaryClass,
    navLinkClass,
    navSecondaryLinkClass,
    siteHeaderClass,
    siteMainClass,
    siteNavClass,
  } from "@repo/utils/chrome";
  import {
    MARKETING_LOCALES,
    mt,
    SUPPORTED_LOCALES,
    type Locale,
  } from "$lib/i18n";
  import { localizedPath, switchLocalePath } from "$lib/locale-path";
  import { GITHUB_REPO_URL, SITE_NAME } from "$lib/site";

  let { data, children } = $props();

  const lang = $derived(data.lang as Locale);
  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const homeHref = $derived(localizedPath(lang));
  const blogHref = $derived(localizedPath(lang, "blog"));
  const year = new Date().getFullYear();
  const copyright = $derived(t("footer.copyright", { year, name: SITE_NAME }));
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  {#each MARKETING_LOCALES as locale (locale)}
    <link
      rel="alternate"
      hreflang={locale}
      href="{data.origin}{switchLocalePath(data.pathname, locale)}"
    />
  {/each}
  <link
    rel="alternate"
    hreflang="x-default"
    href="{data.origin}{switchLocalePath(data.pathname, 'en')}"
  />
</svelte:head>

<div class="flex min-h-screen flex-col">
  <header class={siteHeaderClass}>
    <nav class={siteNavClass} aria-label={t("nav.main")}>
      <div class="flex items-center gap-4">
        <a href={homeHref} class={cn("text-lg", navLinkClass)}>{SITE_NAME}</a>
        <a href={blogHref} class={navSecondaryLinkClass}>
          {t("nav.blog")}
        </a>
      </div>
      <div class="flex items-center gap-2">
        <details
          class={cn(languageSwitcherDetailsClass, languageSwitcherSizes.md)}
          data-locale-menu
        >
          <summary
            class={languageSwitcherSummaryClass}
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
            <span class="truncate">{SUPPORTED_LOCALES[lang]}</span>
          </summary>
          <ul class={languageSwitcherMenuClass} role="list">
            {#each MARKETING_LOCALES as locale (locale)}
              <li>
                <a
                  href={switchLocalePath(data.pathname, locale)}
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
        <div class={iconSlotClass}>
          <a
            href={GITHUB_REPO_URL}
            class={iconButtonClass()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("nav.github")}
            title={t("nav.github")}
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
            >
              <path
                d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-.88.28-1.5 0-2.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 1.5 0 2.5-.75 1.02-1.28 2.26-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
              />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  </header>
  <main class={siteMainClass}>
    {@render children()}
  </main>
  <SiteFooter {copyright} />
</div>
