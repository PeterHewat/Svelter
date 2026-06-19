<script lang="ts">
  import DocsShell from "$lib/components/docs-shell.svelte";
  import { mt, type Locale } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";
  import { SITE_NAME } from "$lib/site";

  let { data } = $props();

  const lang = $derived(data.lang as Locale);
  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const title = $derived(`${t("pages.docs.title")} — ${SITE_NAME}`);
  const description = $derived(t("meta.docsDescription"));
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<DocsShell {lang} docs={data.docs}>
  <header class="mb-10">
    <h1 class="mb-3 text-4xl font-semibold tracking-tight">
      {t("docs.title")}
    </h1>
    <p class="text-muted-foreground text-lg leading-relaxed">
      {t("docs.intro")}
    </p>
  </header>

  <ul class="space-y-4" role="list">
    {#each data.docs as doc (doc.slug)}
      <li>
        <a
          href={localizedPath(lang, `docs/${doc.slug}`)}
          class="border-border bg-card hover:border-foreground/20 group block rounded-xl border p-5 transition-colors"
        >
          <h2
            class="group-hover:text-foreground text-lg font-semibold transition-colors"
          >
            {doc.title}
          </h2>
          <p class="text-muted-foreground mt-1 text-sm leading-relaxed">
            {doc.description}
          </p>
        </a>
      </li>
    {/each}
  </ul>
</DocsShell>
