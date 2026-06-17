<script lang="ts">
  import { mt, type Locale } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";
  import { SITE_NAME } from "$lib/site";

  let { data } = $props();

  const lang = $derived(data.lang as Locale);
  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const title = $derived(`${SITE_NAME} - ${t("home.titleSuffix")}`);
  const description = $derived(t("meta.homeDescription"));
  const blogHref = $derived(localizedPath(lang, "blog"));
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<section class="bg-primary text-primary-foreground py-20">
  <div class="container mx-auto px-4 text-center">
    <h1 class="mb-4 text-5xl font-bold">
      {t("home.heroTitle", { name: SITE_NAME })}
    </h1>
    <p class="mb-8 text-xl opacity-90">
      {t("home.heroSubtitle")}
    </p>
    <a
      href={blogHref}
      class="text-primary inline-block rounded-lg bg-white px-8 py-3 font-semibold transition-colors hover:bg-gray-100"
    >
      {t("home.heroCta")}
    </a>
  </div>
</section>

<section class="bg-muted/30 py-20">
  <div class="container mx-auto px-4">
    <h2 class="mb-12 text-center text-3xl font-bold">
      {t("home.featuresTitle")}
    </h2>
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div class="text-center">
        <h3 class="mb-4 text-xl font-semibold">{t("home.feature1Title")}</h3>
        <p class="text-muted-foreground">{t("home.feature1Body")}</p>
      </div>
      <div class="text-center">
        <h3 class="mb-4 text-xl font-semibold">{t("home.feature2Title")}</h3>
        <p class="text-muted-foreground">{t("home.feature2Body")}</p>
      </div>
      <div class="text-center">
        <h3 class="mb-4 text-xl font-semibold">{t("home.feature3Title")}</h3>
        <p class="text-muted-foreground">{t("home.feature3Body")}</p>
      </div>
    </div>
  </div>
</section>
