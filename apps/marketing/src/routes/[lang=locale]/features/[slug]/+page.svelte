<script lang="ts">
  import { mt, type Locale } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";
  import { SITE_NAME } from "$lib/site";

  let { data } = $props();

  const lang = $derived(data.lang as Locale);
  const t = $derived((key: Parameters<typeof mt>[0]) => mt(key, lang));
  const feature = $derived(data.feature);
  const featuresHref = $derived(localizedPath(lang, "features"));
</script>

<svelte:head>
  <title>{feature.title} — {SITE_NAME}</title>
  <meta name="description" content={feature.description} />
</svelte:head>

<div class="container mx-auto px-4 py-16">
  <p
    class="border-primary/30 bg-primary/5 text-primary mb-6 inline-block rounded-md border px-3 py-1 text-sm"
  >
    {t("stub.templateNotice")}
  </p>
  <p class="text-muted-foreground mb-4 text-sm">
    <a href={featuresHref} class="text-primary underline">
      {t("features.backToOverview")}
    </a>
  </p>
  <h1 class="text-4xl font-bold">{feature.title}</h1>
  <p class="text-muted-foreground mt-6 max-w-2xl text-lg">{feature.body}</p>
  <ul class="mt-8 list-disc space-y-2 pl-6">
    {#each feature.bullets as bullet, index (index)}
      <li class="text-muted-foreground">{bullet}</li>
    {/each}
  </ul>
</div>
