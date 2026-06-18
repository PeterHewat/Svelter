<script lang="ts">
  import { mt, type Locale } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";
  import { marketingContent } from "$lib/marketing-content";
  import { SITE_NAME } from "$lib/site";

  let { data } = $props();

  const lang = $derived(data.lang as Locale);
  const t = $derived((key: Parameters<typeof mt>[0]) => mt(key, lang));
  const stub = marketingContent.stubs.features;
  const deepDives = marketingContent.featureDeepDives;
</script>

<svelte:head>
  <title>{t("pages.features.title")} — {SITE_NAME}</title>
  <meta name="description" content={t("meta.featuresDescription")} />
</svelte:head>

<div class="container mx-auto px-4 py-16">
  <p
    class="border-primary/30 bg-primary/5 text-primary mb-6 inline-block rounded-md border px-3 py-1 text-sm"
  >
    {t("stub.templateNotice")}
  </p>
  <h1 class="text-4xl font-bold">{t("pages.features.title")}</h1>
  <p class="text-muted-foreground mt-6 max-w-2xl text-lg">{stub.intro}</p>

  {#if deepDives.length > 0}
    <section class="mt-12">
      <h2 class="text-2xl font-semibold">{t("features.deepDivesTitle")}</h2>
      <ul class="mt-6 space-y-4">
        {#each deepDives as feature (feature.slug)}
          <li>
            <a
              href={localizedPath(lang, `features/${feature.slug}`)}
              class="group block rounded-lg border p-6 transition-colors hover:border-primary"
            >
              <h3 class="group-hover:text-primary text-xl font-semibold">
                {feature.title}
              </h3>
              <p class="text-muted-foreground mt-2">{feature.description}</p>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</div>
