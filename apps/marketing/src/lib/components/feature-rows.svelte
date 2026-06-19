<script lang="ts">
  import Section from "$lib/components/section.svelte";
  import FeatureRow from "$lib/components/feature-row.svelte";
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
</script>

<Section id="features" title={t("pages.features.title")}>
  <div class="flex w-full flex-col gap-24">
    {#each marketingContent.featureRows as row, index (row.slug)}
      <FeatureRow {row} reversed={index % 2 === 1} />
    {/each}
  </div>
</Section>
