<script lang="ts">
  import "../../app.css";
  import MarketingFooter from "$lib/components/marketing-footer.svelte";
  import MarketingNav from "$lib/components/marketing-nav.svelte";
  import { MARKETING_LOCALES, mt, type Locale } from "$lib/i18n";
  import { switchLocalePath } from "$lib/locale-path";
  import { productAppOrigin } from "$lib/product-links";
  import { SITE_NAME } from "$lib/site";

  let { data, children } = $props();

  const lang = $derived(data.lang as Locale);
  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const year = new Date().getFullYear();
  const copyright = $derived(t("footer.copyright", { year, name: SITE_NAME }));
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

<div class="flex min-h-screen flex-col">
  <MarketingNav {lang} pathname={data.pathname} />
  <main class="flex-1 pt-20">
    {@render children()}
  </main>
  <MarketingFooter {lang} {copyright} />
</div>
