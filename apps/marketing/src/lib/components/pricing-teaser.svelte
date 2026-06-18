<script lang="ts">
  import PricingTierCard from "$lib/components/pricing-tier-card.svelte";
  import Section from "$lib/components/section.svelte";
  import { mt, type Locale } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";
  import { marketingContent } from "$lib/marketing-content";

  interface Props {
    lang: Locale;
  }

  let { lang }: Props = $props();

  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const pricingHref = $derived(localizedPath(lang, "pricing"));
</script>

<Section title={t("home.pricingTeaserTitle")} class="bg-muted/30">
  <div class="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
    {#each marketingContent.pricingTiers as tier (tier.id)}
      <PricingTierCard {lang} {tier} billing="monthly" />
    {/each}
  </div>
  <p class="mt-10 text-center">
    <a href={pricingHref} class="text-primary font-medium hover:underline">
      {t("home.pricingTeaserLink")} →
    </a>
  </p>
</Section>
