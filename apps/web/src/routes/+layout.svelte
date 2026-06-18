<script lang="ts">
  import "../app.css";
  import { PRODUCT_NAME } from "@repo/config/product";
  import { SiteFooter } from "@repo/ui-svelte";
  import { siteMainContainerClass } from "@repo/utils/chrome";
  import { initializeTheme } from "@repo/utils/theme";
  import { onMount } from "svelte";
  import ClerkDeferredLayout from "$lib/components/clerk-deferred-layout.svelte";
  import AppHeader from "$lib/components/app-header.svelte";
  import { isAuthEnabled } from "$lib/backend";
  import { loadWebEnv } from "$lib/web-env";
  import { useTranslation } from "$lib/i18n";
  import "$lib/i18n";

  let { children } = $props();

  const { t } = useTranslation();
  const env = loadWebEnv();
  const year = new Date().getFullYear();
  const copyright = $derived(
    t("footer.copyright", { year, name: PRODUCT_NAME }),
  );

  onMount(() => {
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
  <ClerkDeferredLayout publishableKey={env.clerkPublishableKey} {copyright}>
    {@render children()}
  </ClerkDeferredLayout>
{:else}
  <div class="flex min-h-screen flex-col">
    <AppHeader mode="anonymous" />
    <main class={siteMainContainerClass}>
      {@render children()}
    </main>
    <SiteFooter {copyright} />
  </div>
{/if}
