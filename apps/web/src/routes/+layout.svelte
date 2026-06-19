<script lang="ts">
  import "../app.css";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { PRODUCT_NAME } from "@repo/config/product";
  import { SiteFooter } from "@repo/ui-svelte";
  import { siteMainContainerClass } from "@repo/utils/chrome";
  import {
    applyCrossAppPrefsFromUrl,
    urlWithoutCrossAppPrefs,
  } from "@repo/utils/cross-app-prefs";
  import { initializeTheme, useThemeStore } from "@repo/utils/theme";
  import { onMount } from "svelte";
  import ClerkDeferredLayout from "$lib/components/clerk-deferred-layout.svelte";
  import AppHeader from "$lib/components/app-header.svelte";
  import { isAuthEnabled } from "$lib/backend";
  import { loadWebEnv } from "$lib/web-env";
  import { useTranslation } from "$lib/i18n";
  import { marketingHomeHref } from "$lib/marketing-link";
  import "$lib/i18n";

  let { children } = $props();

  const i18n = useTranslation();
  const themeStore = useThemeStore;
  let linkTheme = $state(themeStore.getState().resolvedTheme);

  $effect(() => {
    return themeStore.subscribe((state) => {
      linkTheme = state.resolvedTheme;
    });
  });

  const env = loadWebEnv();
  const year = new Date().getFullYear();
  const copyright = $derived(
    i18n.t("footer.copyright", { year, name: PRODUCT_NAME }),
  );
  const marketingHomeUrl = $derived(
    marketingHomeHref(i18n.locale, { theme: linkTheme }),
  );

  onMount(() => {
    applyCrossAppPrefsFromUrl(page.url.searchParams);
    const cleanedUrl = urlWithoutCrossAppPrefs(page.url);
    if (cleanedUrl) {
      void goto(cleanedUrl, {
        replaceState: true,
        keepFocus: true,
        noScroll: true,
      });
    }
    initializeTheme();
    requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-transition");
    });
  });
</script>

<svelte:head>
  <title>{PRODUCT_NAME}</title>
</svelte:head>

{#if isAuthEnabled() && env.clerkPublishableKey}
  <ClerkDeferredLayout
    publishableKey={env.clerkPublishableKey}
    {copyright}
    marketingHomeHref={marketingHomeUrl}
  >
    {@render children()}
  </ClerkDeferredLayout>
{:else}
  <div class="flex min-h-screen flex-col">
    <AppHeader mode="anonymous" />
    <main class={siteMainContainerClass}>
      {@render children()}
    </main>
    <SiteFooter {copyright} homeHref={marketingHomeUrl} />
  </div>
{/if}
