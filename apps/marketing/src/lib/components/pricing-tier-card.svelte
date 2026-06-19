<script lang="ts">
  import { cn } from "@repo/utils";
  import type { PricingTier } from "$lib/marketing-content";
  import { useMarketingT } from "$lib/marketing-context";

  interface Props {
    tier: PricingTier;
    billing: "monthly" | "annual";
  }

  let { tier, billing }: Props = $props();

  const t = useMarketingT();

  const price = $derived(
    billing === "monthly" ? tier.monthlyPrice : tier.annualPrice,
  );
  const period = $derived(
    billing === "monthly" ? tier.monthlyPeriod : tier.annualPeriod,
  );
</script>

<article
  class={cn(
    "border-border bg-card flex flex-col rounded-xl border p-6 shadow-sm",
    tier.highlighted && "border-primary ring-primary/20 ring-2",
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
  <p class="mt-2">
    <span class="text-3xl font-bold">{price}</span>
    <span class="text-muted-foreground ml-1 text-sm">{period}</span>
  </p>
  {#if billing === "annual" && tier.annualNote}
    <p class="text-muted-foreground mt-1 text-xs">{tier.annualNote}</p>
  {/if}
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
