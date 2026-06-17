<script lang="ts">
  import { mt, type Locale } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";
  import { SITE_NAME } from "$lib/site";

  let { data } = $props();

  const lang = $derived(data.lang as Locale);
  const t = $derived((key: Parameters<typeof mt>[0]) => mt(key, lang));
</script>

<svelte:head>
  <title>{t("blog.title")} — {SITE_NAME}</title>
</svelte:head>

<div class="container mx-auto px-4 py-16">
  <h1 class="mb-8 text-4xl font-bold">{t("blog.title")}</h1>
  <ul class="space-y-6">
    {#each data.posts as post (post.slug)}
      <li>
        <a href={localizedPath(lang, `blog/${post.slug}`)} class="group block">
          <h2 class="group-hover:text-primary text-2xl font-semibold">
            {post.title}
          </h2>
          <p class="text-muted-foreground mt-1 text-sm">
            {new Date(post.pubDate).toLocaleDateString(lang)}
            {#if post.author}
              · {post.author}
            {/if}
          </p>
          <p class="text-muted-foreground mt-2">{post.description}</p>
        </a>
      </li>
    {/each}
  </ul>
</div>
