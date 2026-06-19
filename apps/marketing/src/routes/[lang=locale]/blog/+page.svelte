<script lang="ts">
  import BlogIndex from "$lib/components/blog-index.svelte";
  import { mt, type Locale } from "$lib/i18n";
  import { SITE_NAME } from "$lib/site";

  let { data } = $props();

  const lang = $derived(data.lang as Locale);
  const t = $derived((key: Parameters<typeof mt>[0]) => mt(key, lang));
</script>

<svelte:head>
  <title>{t("blog.title")} — {SITE_NAME}</title>
  <meta name="description" content={t("meta.blogDescription")} />
</svelte:head>

<div class="marketing-container py-16 md:py-20">
  <h1 class="mb-10 text-4xl font-semibold tracking-tight">{t("blog.title")}</h1>
  <BlogIndex {lang} posts={data.posts} />
</div>
