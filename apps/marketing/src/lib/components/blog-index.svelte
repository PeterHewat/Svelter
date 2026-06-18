<script lang="ts">
  import { cn } from "@repo/utils";
  import { mt, type Locale } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";
  import type { BlogPost } from "$lib/posts";

  interface Props {
    lang: Locale;
    posts: BlogPost[];
  }

  let { lang, posts }: Props = $props();

  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const groupName = "blog-filter";
  const allId = "blog-filter-all";
  const articleId = "blog-filter-article";
  const changelogId = "blog-filter-changelog";

  const tabs = [
    { id: "all", inputId: allId, labelKey: "blog.filterAll" as const },
    {
      id: "article",
      inputId: articleId,
      labelKey: "blog.filterArticles" as const,
    },
    {
      id: "changelog",
      inputId: changelogId,
      labelKey: "blog.filterChangelog" as const,
    },
  ];
</script>

<div class="blog-index">
  <input
    type="radio"
    id={allId}
    name={groupName}
    checked
    class="blog-filter-all sr-only"
  />
  <input
    type="radio"
    id={articleId}
    name={groupName}
    class="blog-filter-article sr-only"
  />
  <input
    type="radio"
    id={changelogId}
    name={groupName}
    class="blog-filter-changelog sr-only"
  />

  <div
    class="mb-8 flex flex-wrap gap-2"
    role="group"
    aria-label={t("blog.filterLabel")}
  >
    {#each tabs as tab (tab.id)}
      <label
        for={tab.inputId}
        class={cn(
          "blog-filter-label cursor-pointer rounded-md border px-4 py-2 text-sm font-medium transition-colors",
          `blog-filter-label-${tab.id}`,
        )}
      >
        {t(tab.labelKey)}
      </label>
    {/each}
  </div>

  <ul class="blog-post-list m-0 list-none space-y-6 p-0">
    {#each posts as post (post.slug)}
      <li class="blog-post-{post.type}">
        <a href={localizedPath(lang, `blog/${post.slug}`)} class="group block">
          <h2 class="group-hover:text-primary text-2xl font-semibold">
            {post.title}
            {#if post.type === "changelog" && post.version}
              <span class="text-muted-foreground ml-2 text-base font-normal">
                {t("blog.changelogVersion", { version: post.version })}
              </span>
            {/if}
          </h2>
          <p class="text-muted-foreground mt-1 text-sm">
            {new Date(post.pubDate).toLocaleDateString(lang)}
            {#if post.author}
              · {post.author}
            {/if}
            {#if post.type === "changelog"}
              · {t("blog.filterChangelog")}
            {/if}
          </p>
          <p class="text-muted-foreground mt-2">{post.description}</p>
        </a>
      </li>
    {/each}
  </ul>
</div>

<style>
  .blog-filter-label {
    border-color: var(--border);
    background: color-mix(in oklab, var(--muted) 40%, transparent);
    color: var(--foreground);
  }

  .blog-filter-label:hover {
    background: var(--muted);
  }

  .blog-filter-all:checked ~ div .blog-filter-label-all,
  .blog-filter-article:checked ~ div .blog-filter-label-article,
  .blog-filter-changelog:checked ~ div .blog-filter-label-changelog {
    border-color: var(--primary);
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .blog-post-list > li {
    display: block;
  }

  .blog-filter-article:checked ~ .blog-post-list .blog-post-changelog {
    display: none;
  }

  .blog-filter-changelog:checked ~ .blog-post-list .blog-post-article {
    display: none;
  }
</style>
