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
  const blogHref = $derived(localizedPath(lang, "blog"));
</script>

<svelte:head>
  <title>{data.post.title} — {SITE_NAME}</title>
  <meta name="description" content={data.post.description} />
</svelte:head>

<article class="container mx-auto max-w-2xl px-4 py-16">
  <header class="mb-8">
    <h1 class="mb-2 text-4xl font-bold">{data.post.title}</h1>
    <p class="text-muted-foreground text-sm">
      {new Date(data.post.pubDate).toLocaleDateString(lang)}
      {#if data.post.type === "changelog" && data.post.version}
        · {t("blog.changelogVersion", { version: data.post.version })}
      {/if}
      {#if data.post.author}
        · {data.post.author}
      {/if}
    </p>
  </header>
  <div
    class="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap"
  >
    {data.post.content}
  </div>
  <p class="mt-12">
    <a href={blogHref} class="text-primary underline">{t("blog.back")}</a>
  </p>
</article>
