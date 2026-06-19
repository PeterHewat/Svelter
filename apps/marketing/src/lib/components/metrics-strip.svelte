<script lang="ts">
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
