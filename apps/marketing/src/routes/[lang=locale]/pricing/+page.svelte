<script lang="ts">
  import CtaBand from "$lib/components/cta-band.svelte";
  import Faq from "$lib/components/faq.svelte";
  import OgMeta from "$lib/components/og-meta.svelte";
  import PricingTable from "$lib/components/pricing-table.svelte";
  import { mt, type Locale } from "$lib/i18n";
  import { marketingContent } from "$lib/marketing-content";
  import { SITE_NAME } from "$lib/site";

  let { data } = $props();

  const lang = $derived(data.lang as Locale);
  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const title = $derived(`${t("pages.pricing.title")} — ${SITE_NAME}`);
  const description = $derived(t("meta.pricingDescription"));
  const canonicalUrl = $derived(`${data.origin}${data.pathname}`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <OgMeta {title} {description} url={canonicalUrl} />
</svelte:head>

<div class="border-border border-b py-12">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-4xl font-bold tracking-tight">
      {t("pages.pricing.title")}
    </h1>
    <p class="text-muted-foreground mx-auto mt-4 max-w-2xl">
      {t("pricing.subtitle")}
    </p>
  </div>
</div>

<PricingTable {lang} />

<Faq
  {lang}
  items={marketingContent.pricingPage.faq}
  titleKey="pricing.faqTitle"
/>

<CtaBand {lang} />
