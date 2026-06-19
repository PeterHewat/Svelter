<script lang="ts">
  import Section from "$lib/components/section.svelte";
  import { useMarketingT } from "$lib/marketing-context";
  import { marketingContent } from "$lib/marketing-content";

  const t = useMarketingT();
</script>

<Section title={t("home.metricsTitle")}>
  <ul class="mx-auto grid max-w-4xl gap-8 md:grid-cols-3" role="list">
    {#each marketingContent.metrics as metric (metric.label)}
      <li class="text-center">
        <p class="text-primary mb-2 text-4xl font-bold tracking-tight">
          {metric.value}
        </p>
        <p class="text-muted-foreground text-sm">{metric.label}</p>
      </li>
    {/each}
  </ul>
</Section>
