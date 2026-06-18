<script lang="ts">
  import Section from "$lib/components/section.svelte";
  import FeatureRow from "$lib/components/feature-row.svelte";
  import { marketingContent } from "$lib/marketing-content";
</script>

<Section class="bg-muted/30">
  <div class="mx-auto flex max-w-5xl flex-col gap-20">
    {#each marketingContent.featureRows as row, index (row.title)}
      <FeatureRow {row} reversed={index % 2 === 1} />
    {/each}
  </div>
</Section>
