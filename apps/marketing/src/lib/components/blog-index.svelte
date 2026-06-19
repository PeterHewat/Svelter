<script lang="ts">
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
</script>

<ul class="m-0 list-none space-y-8 p-0" role="list">
  {#each posts as post (post.slug)}
    <li>
      <a
        href={localizedPath(lang, `blog/${post.slug}`)}
        class="group border-border hover:border-foreground/20 block rounded-xl border p-6 transition-colors"
      >
        <h2
          class="group-hover:text-foreground text-xl font-semibold transition-colors"
        >
          {post.title}
          {#if post.type === "changelog" && post.version}
            <span class="text-muted-foreground ml-2 text-base font-normal">
              {t("blog.changelogVersion", { version: post.version })}
            </span>
          {/if}
        </h2>
        <p class="text-muted-foreground mt-2 text-sm">
          {new Date(post.pubDate).toLocaleDateString(lang)}
          {#if post.author}
            · {post.author}
          {/if}
          {#if post.type === "changelog"}
            · {t("blog.changelogLabel")}
          {/if}
        </p>
        <p class="text-muted-foreground mt-3 leading-relaxed">
          {post.description}
        </p>
      </a>
    </li>
  {/each}
</ul>
