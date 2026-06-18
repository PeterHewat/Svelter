<script lang="ts">
  import CtaBand from "$lib/components/cta-band.svelte";
  import Faq from "$lib/components/faq.svelte";
  import FeatureRows from "$lib/components/feature-rows.svelte";
  import Hero from "$lib/components/hero.svelte";
  import HowItWorks from "$lib/components/how-it-works.svelte";
  import IntegrationsGrid from "$lib/components/integrations-grid.svelte";
  import LogoBar from "$lib/components/logo-bar.svelte";
  import MetricsStrip from "$lib/components/metrics-strip.svelte";
  import OgMeta from "$lib/components/og-meta.svelte";
  import PricingTeaser from "$lib/components/pricing-teaser.svelte";
  import Testimonial from "$lib/components/testimonial.svelte";
  import { mt, type Locale } from "$lib/i18n";
  import { marketingSections } from "$lib/marketing-content";
  import { SITE_NAME } from "$lib/site";

  let { data } = $props();

  const lang = $derived(data.lang as Locale);
  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const title = $derived(`${SITE_NAME} - ${t("home.titleSuffix")}`);
  const description = $derived(t("meta.homeDescription"));
  const canonicalUrl = $derived(`${data.origin}${data.pathname}`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <OgMeta {title} {description} url={canonicalUrl} />
</svelte:head>

<Hero {lang} />

{#if marketingSections.logoBar.enabled}
  <LogoBar />
{/if}

{#if marketingSections.howItWorks.enabled}
  <HowItWorks {lang} />
{/if}

{#if marketingSections.featureRows.enabled}
  <FeatureRows />
{/if}

{#if marketingSections.metrics.enabled}
  <MetricsStrip {lang} />
{/if}

{#if marketingSections.pricingTeaser.enabled}
  <PricingTeaser {lang} />
{/if}

{#if marketingSections.testimonial.enabled}
  <Testimonial />
{/if}

{#if marketingSections.integrations.enabled}
  <IntegrationsGrid {lang} />
{/if}

{#if marketingSections.faq.enabled}
  <Faq {lang} jsonLd />
{/if}

{#if marketingSections.ctaBand.enabled}
  <CtaBand {lang} />
{/if}
