<script lang="ts">
  import { cn } from "@repo/utils";
  import { mt, type Locale } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";
  import type { DocPage } from "$lib/docs";

  interface Props {
    lang: Locale;
    docs: DocPage[];
    currentSlug?: string;
  }

  let { lang, docs, currentSlug }: Props = $props();

  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const docsIndexHref = $derived(localizedPath(lang, "docs"));
</script>

<nav aria-label={t("docs.sidebar")} class="docs-sidebar">
  <a
    href={docsIndexHref}
    class={cn(
      "hover:text-foreground mb-4 block text-sm font-semibold transition-colors",
      currentSlug ? "text-muted-foreground" : "text-foreground",
    )}
  >
    {t("docs.title")}
  </a>
  <ul class="space-y-1" role="list">
    {#each docs as doc (doc.slug)}
      {@const href = localizedPath(lang, `docs/${doc.slug}`)}
      <li>
        <a
          {href}
          class={cn(
            "block rounded-md px-3 py-2 text-sm transition-colors",
            currentSlug === doc.slug
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
          )}
          aria-current={currentSlug === doc.slug ? "page" : undefined}
        >
          {doc.title}
        </a>
      </li>
    {/each}
  </ul>
</nav>
