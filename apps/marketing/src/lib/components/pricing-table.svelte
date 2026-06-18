<script lang="ts">
  import PricingTierCard from "$lib/components/pricing-tier-card.svelte";
  import Section from "$lib/components/section.svelte";
  import { mt, type Locale } from "$lib/i18n";
  import { marketingContent } from "$lib/marketing-content";

  interface Props {
    lang: Locale;
  }

  let { lang }: Props = $props();

  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );

  const tiers = marketingContent.pricingTiers;
  const { comparisonRows, enterprise } = marketingContent.pricingPage;
  const monthlyId = "pricing-page-monthly";
  const annualId = "pricing-page-annual";
</script>

<div class="pricing-table-root">
  <input
    type="radio"
    id={monthlyId}
    name="pricing-page-billing"
    checked
    class="billing-monthly sr-only"
  />
  <input
    type="radio"
    id={annualId}
    name="pricing-page-billing"
    class="billing-annual sr-only"
  />

  <Section class="pricing-cards-section pt-8 pb-12">
    <div class="mx-auto mb-10 max-w-2xl text-center">
      <p class="text-muted-foreground">{marketingContent.pricingPage.intro}</p>
    </div>

    <div
      class="mb-10 flex flex-col items-center gap-2"
      role="group"
      aria-label={t("pricing.billingToggle")}
    >
      <div class="border-border bg-muted/40 inline-flex rounded-lg border p-1">
        <label
          for={monthlyId}
          class="billing-label billing-label-monthly cursor-pointer rounded-md px-4 py-2 text-sm font-medium"
        >
          {t("pricing.billingMonthly")}
        </label>
        <label
          for={annualId}
          class="billing-label billing-label-annual cursor-pointer rounded-md px-4 py-2 text-sm font-medium"
        >
          {t("pricing.billingAnnual")}
        </label>
      </div>
      <p class="text-muted-foreground text-sm">{t("pricing.annualSave")}</p>
    </div>

    <div class="monthly-cards mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
      {#each tiers as tier (tier.id)}
        <PricingTierCard {lang} {tier} billing="monthly" />
      {/each}
    </div>

    <div class="annual-cards mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
      {#each tiers as tier (tier.id)}
        <PricingTierCard {lang} {tier} billing="annual" />
      {/each}
    </div>
  </Section>

  <Section title={t("pricing.compareTitle")} class="bg-muted/30">
    <div class="mx-auto max-w-5xl overflow-x-auto">
      <table class="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr class="border-border border-b">
            <th class="px-4 py-3 font-semibold" scope="col"
              >{t("pricing.featureColumn")}</th
            >
            {#each tiers as tier (tier.id)}
              <th class="px-4 py-3 text-center font-semibold" scope="col"
                >{tier.name}</th
              >
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each comparisonRows as row (row.feature)}
            <tr class="border-border border-b">
              <th class="px-4 py-3 font-medium" scope="row">{row.feature}</th>
              {#each ["free", "pro", "business"] as tierId (tierId)}
                {@const cell = row[tierId as "free" | "pro" | "business"]}
                <td class="px-4 py-3 text-center">
                  {#if cell === "included"}
                    <span
                      class="text-primary font-semibold"
                      aria-label={t("pricing.included")}>✓</span
                    >
                  {:else if cell === "excluded"}
                    <span
                      class="text-muted-foreground"
                      aria-label={t("pricing.excluded")}>—</span
                    >
                  {:else}
                    {cell}
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
          <tr class="border-border bg-muted/20 border-b">
            <th class="px-4 py-3 font-medium" scope="row">{enterprise.name}</th>
            <td class="text-muted-foreground px-4 py-3 text-center" colspan="3">
              {enterprise.description}
              <a
                href="mailto:{enterprise.contactEmail}"
                class="text-primary mt-2 block font-medium hover:underline"
              >
                {t("pricing.enterpriseContact")} →
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Section>
</div>

<style>
  :global(.pricing-table-root .annual-cards) {
    display: none;
  }

  :global(
    .pricing-table-root
      input[name="pricing-page-billing"]:last-of-type:checked
      ~ section.pricing-cards-section
      .monthly-cards
  ) {
    display: none;
  }

  :global(
    .pricing-table-root
      input[name="pricing-page-billing"]:last-of-type:checked
      ~ section.pricing-cards-section
      .annual-cards
  ) {
    display: grid;
  }

  :global(.pricing-table-root .billing-label) {
    color: var(--muted-foreground);
  }

  :global(
    .pricing-table-root
      input[name="pricing-page-billing"]:first-of-type:checked
      ~ section.pricing-cards-section
      .billing-label-monthly
  ),
  :global(
    .pricing-table-root
      input[name="pricing-page-billing"]:last-of-type:checked
      ~ section.pricing-cards-section
      .billing-label-annual
  ) {
    background-color: var(--primary);
    color: var(--primary-foreground);
  }
</style>
