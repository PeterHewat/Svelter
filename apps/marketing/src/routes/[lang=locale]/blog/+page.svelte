<script lang="ts">
  import BlogIndex from "$lib/components/blog-index.svelte";
  import { useMarketingT } from "$lib/marketing-context";
  import { SITE_NAME } from "$lib/site";

  let { data } = $props();

  const t = useMarketingT();
</script>

<svelte:head>
  <title>{t("blog.title")} — {SITE_NAME}</title>
  <meta name="description" content={t("meta.blogDescription")} />
</svelte:head>

<div class="marketing-container py-16 md:py-20">
  <h1 class="mb-10 text-4xl font-semibold tracking-tight">{t("blog.title")}</h1>
  <BlogIndex posts={data.posts} />
</div>
