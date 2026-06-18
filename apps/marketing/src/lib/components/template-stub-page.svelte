<script lang="ts">
  import { mt, type Locale } from "$lib/i18n";
  import { SITE_NAME } from "$lib/site";
  import type { Snippet } from "svelte";

  interface Props {
    lang: Locale;
    titleKey: Parameters<typeof mt>[0];
    /** Body paragraphs from the content module — replace in v1. */
    paragraphs?: string[];
    descriptionKey?: Parameters<typeof mt>[0];
    children?: Snippet;
  }

  let {
    lang,
    titleKey,
    paragraphs = [],
    descriptionKey,
    children,
  }: Props = $props();

  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const title = $derived(t(titleKey));
  const description = $derived(descriptionKey ? t(descriptionKey) : undefined);
</script>

<svelte:head>
  <title>{title} — {SITE_NAME}</title>
  {#if description}
    <meta name="description" content={description} />
  {/if}
</svelte:head>

<div class="container mx-auto px-4 py-16">
  <p
    class="border-primary/30 bg-primary/5 text-primary mb-6 inline-block rounded-md border px-3 py-1 text-sm"
  >
    {t("stub.templateNotice")}
  </p>
  <h1 class="text-4xl font-bold">{title}</h1>
  {#each paragraphs as paragraph, index (index)}
    <p class="text-muted-foreground mt-6 max-w-2xl text-lg">{paragraph}</p>
  {/each}
  {@render children?.()}
</div>
