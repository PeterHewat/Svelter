<script lang="ts">
  import Section from "$lib/components/section.svelte";
  import FeatureRow from "$lib/components/feature-row.svelte";
  import { useMarketingT } from "$lib/marketing-context";
  import { marketingContent } from "$lib/marketing-content";

  const t = useMarketingT();
</script>

<Section id="features" title={t("pages.features.title")}>
  <div class="flex w-full flex-col gap-24">
    {#each marketingContent.featureRows as row, index (row.slug)}
      <FeatureRow {row} reversed={index % 2 === 1} delay={index * 80} />
    {/each}
  </div>
</Section>
