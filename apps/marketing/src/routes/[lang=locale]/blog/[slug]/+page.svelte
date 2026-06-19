<script lang="ts">
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
  const blogHref = $derived(localizedPath(lang, "blog"));
</script>

<svelte:head>
  <title>{data.post.title} — {SITE_NAME}</title>
  <meta name="description" content={data.post.description} />
</svelte:head>

<article class="marketing-container max-w-2xl py-16 md:py-20">
  <header class="mb-8">
    <h1 class="mb-2 text-4xl font-semibold tracking-tight">
      {data.post.title}
    </h1>
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
  <MarkdownContent html={data.post.html} />
  <p class="mt-12">
    <a
      href={blogHref}
      class="text-foreground text-sm underline underline-offset-4"
    >
      {t("blog.back")}
    </a>
  </p>
</article>
