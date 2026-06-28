<script lang="ts">
  import PricingTierCard from "$lib/components/pricing-tier-card.svelte";
  import Reveal from "$lib/components/reveal.svelte";
  import Section from "$lib/components/section.svelte";
  import { useMarketingT } from "$lib/marketing-context";
  import { marketingContent } from "$lib/marketing-content";

  const t = useMarketingT();

  const tiers = marketingContent.pricingTiers;
  const { comparisonRows, enterprise } = marketingContent.pricingPage;
  const monthlyId = "pricing-billing-monthly";
  const annualId = "pricing-billing-annual";
</script>

<div class="pricing-table-root">
  <Section id="pricing" class="pricing-cards-section pb-12">
    <Reveal>
      <h2
        class="marketing-section-title mb-8 text-center font-semibold tracking-tight text-balance"
      >
        {t("pages.pricing.title")}
      </h2>
      <p
        class="text-muted-foreground mx-auto mb-10 max-w-2xl text-center text-lg"
      >
        {t("pricing.subtitle")}
      </p>
    </Reveal>
    <Reveal delay={80}>
      <p class="text-muted-foreground mx-auto mb-10 max-w-2xl text-center">
        {marketingContent.pricingPage.intro}
      </p>
    </Reveal>

    <Reveal delay={120}>
      <div
        class="mb-10 flex flex-col items-center gap-2"
        role="group"
        aria-label={t("pricing.billingToggle")}
      >
        <div
          class="billing-toggle border-border bg-muted/40 relative inline-grid grid-cols-2 rounded-lg border p-1"
        >
          <span class="billing-toggle-thumb" aria-hidden="true"></span>
          <label
            class="billing-label billing-label-monthly cursor-pointer rounded-md px-4 py-2 text-center text-sm font-medium"
          >
            <input
              type="radio"
              id={monthlyId}
              name="pricing-billing"
              checked
              class="billing-monthly billing-input"
            />
            {t("pricing.billingMonthly")}
          </label>
          <label
            class="billing-label billing-label-annual cursor-pointer rounded-md px-4 py-2 text-center text-sm font-medium"
          >
            <input
              type="radio"
              id={annualId}
              name="pricing-billing"
              class="billing-annual billing-input"
            />
            {t("pricing.billingAnnual")}
          </label>
        </div>
        <p class="text-muted-foreground text-sm">{t("pricing.annualSave")}</p>
      </div>
    </Reveal>

    <div class="pricing-cards mx-auto max-w-5xl gap-6 md:grid-cols-3">
      {#each tiers as tier, index (tier.id)}
        <Reveal delay={160 + index * 80}>
          <PricingTierCard {tier} />
        </Reveal>
      {/each}
    </div>
  </Section>

  <Section>
    <Reveal>
      <h2
        class="marketing-section-title mb-8 text-center font-semibold tracking-tight text-balance"
      >
        {t("pricing.compareTitle")}
      </h2>
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
              <th class="px-4 py-3 font-medium" scope="row"
                >{enterprise.name}</th
              >
              <td
                class="text-muted-foreground px-4 py-3 text-center"
                colspan="3"
              >
                {enterprise.description}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Reveal>
  </Section>
</div>
