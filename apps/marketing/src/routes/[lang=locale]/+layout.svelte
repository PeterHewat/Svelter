<script lang="ts">
  import "../../app.css";
  import MarketingFooter from "$lib/components/marketing-footer.svelte";
  import MarketingLocaleProvider from "$lib/components/marketing-locale-provider.svelte";
  import MarketingNav from "$lib/components/marketing-nav.svelte";
  import { MARKETING_LOCALES, type Locale } from "$lib/i18n";
  import { switchLocalePath } from "$lib/locale-path";
  import { productAppOrigin } from "$lib/product-links";

  let { data, children } = $props();

  const lang = $derived(data.lang as Locale);
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <meta name="product-app-origin" content={productAppOrigin()} />
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
