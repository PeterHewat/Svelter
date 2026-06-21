<script lang="ts">
  import "../../app.css";
  import MarketingFooter from "$lib/components/marketing-footer.svelte";
  import MarketingLocaleProvider from "$lib/components/marketing-locale-provider.svelte";
  import MarketingNav from "$lib/components/marketing-nav.svelte";
  import { MARKETING_LOCALES, type Locale } from "$lib/i18n";
  import { switchLocalePath } from "$lib/locale-path";
  import { productAppOriginMetaContent } from "$lib/product-links";

  let { data, children } = $props();

  const lang = $derived(data.lang as Locale);
  const bakedProductOrigin = productAppOriginMetaContent();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  {#if bakedProductOrigin}
    <meta name="product-app-origin" content={bakedProductOrigin} />
  {/if}
  <link rel="canonical" href="{data.origin}{data.pathname}" />
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

<MarketingLocaleProvider {lang}>
  <div class="flex min-h-screen flex-col">
    <MarketingNav pathname={data.pathname} />
    <main class="flex-1 pt-20">
      {@render children()}
    </main>
    <MarketingFooter />
  </div>
</MarketingLocaleProvider>
