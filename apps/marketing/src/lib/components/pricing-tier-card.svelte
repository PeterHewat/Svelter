<script lang="ts">
  import { cn } from "@repo/utils";
  import type { PricingTier } from "$lib/marketing-content";
  import { useMarketingT } from "$lib/marketing-context";

  interface Props {
    tier: PricingTier;
  }

  let { tier }: Props = $props();

  const t = useMarketingT();

  const isFreeTier = $derived(tier.id === "free");
  const monthlyAmount = $derived(tier.monthlyPrice.replace(/^\$/, ""));
  const annualAmount = $derived(tier.annualPrice.replace(/^\$/, ""));
  /** Reserve width for the longest formatted price so the period label does not shift. */
  const priceMinCh = $derived(
    Math.max(tier.monthlyPrice.length, tier.annualPrice.length),
  );
</script>

<article
  class={cn(
    "border-border bg-card flex flex-col rounded-xl border p-6 shadow-sm",
    tier.highlighted && "border-primary ring-primary/20 ring-2",
    !isFreeTier && "pricing-tier-paid",
  )}
>
  {#if tier.highlighted}
    <p
      class="bg-primary text-primary-foreground mb-4 inline-flex w-fit rounded-full px-3 py-0.5 text-xs font-semibold"
    >
      {t("home.freeTierBadge")}
    </p>
  {:else if tier.popular}
    <p
      class="bg-muted text-muted-foreground mb-4 inline-flex w-fit rounded-full px-3 py-0.5 text-xs font-semibold"
    >
      {t("home.popularTierBadge")}
    </p>
  {:else}
    <div class="mb-4 h-5" aria-hidden="true"></div>
  {/if}
  <h3 class="text-lg font-semibold">{tier.name}</h3>
  {#if isFreeTier}
    <p class="pricing-price mt-2">
      <span class="pricing-price-static inline-flex items-baseline gap-1">
        <span
          class="pricing-price-amount text-3xl font-bold"
          style:min-width="{priceMinCh}ch"
        >
          {tier.monthlyPrice}
        </span>
        <span class="text-muted-foreground text-sm">{tier.monthlyPeriod}</span>
      </span>
    </p>
  {:else}
    <p class="pricing-price mt-2">
      <span class="pricing-price-display">
        <span class="pricing-price-monthly">
          <span class="pricing-price-row inline-flex items-baseline gap-1">
            <span
              class="pricing-price-amount text-3xl font-bold"
              style:min-width="{priceMinCh}ch"
              data-pricing-amount
              data-monthly={monthlyAmount}
              data-annual={annualAmount}
            >
              {tier.monthlyPrice}
            </span>
            <span class="text-muted-foreground text-sm"
              >{tier.monthlyPeriod}</span
            >
          </span>
        </span>
        <span class="pricing-price-annual" aria-hidden="true">
          <span class="pricing-price-row inline-flex items-baseline gap-1">
            <span
              class="pricing-price-amount text-3xl font-bold"
              style:min-width="{priceMinCh}ch"
            >
              {tier.annualPrice}
            </span>
            <span class="text-muted-foreground text-sm"
              >{tier.annualPeriod}</span
            >
          </span>
        </span>
      </span>
    </p>
  {/if}
  <p class="pricing-annual-note text-muted-foreground mt-1 min-h-4 text-xs">
    <span class={cn("pricing-annual-note-text", tier.annualNote && "has-note")}>
      {tier.annualNote || "\u00a0"}
    </span>
  </p>
  <p class="text-muted-foreground mt-3 text-sm">{tier.description}</p>
  <ul class="mt-4 flex-1 space-y-2 text-sm" role="list">
    {#each tier.limits as limit (limit)}
      <li class="flex gap-2">
        <span class="text-primary" aria-hidden="true">✓</span>
        <span>{limit}</span>
      </li>
    {/each}
  </ul>
</article>
