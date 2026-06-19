<script lang="ts">
  import DocsShell from "$lib/components/docs-shell.svelte";
  import MarkdownContent from "$lib/components/markdown-content.svelte";
  import { mt, type Locale } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";
  import { SITE_NAME } from "$lib/site";

  let { data } = $props();

  const lang = $derived(data.lang as Locale);
  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const doc = $derived(data.doc);
  const title = $derived(`${doc.title} — ${SITE_NAME}`);
  const docsHref = $derived(localizedPath(lang, "docs"));
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={doc.description} />
</svelte:head>

<DocsShell {lang} docs={data.docs} currentSlug={doc.slug}>
  <article>
    <header class="mb-8">
      <h1 class="mb-2 text-4xl font-semibold tracking-tight">{doc.title}</h1>
      <p class="text-muted-foreground text-lg">{doc.description}</p>
    </header>
    <MarkdownContent html={doc.html} />
    <p class="mt-12">
      <a
        href={docsHref}
        class="text-foreground text-sm underline underline-offset-4"
      >
        {t("docs.back")}
      </a>
    </p>
  </article>
</DocsShell>
