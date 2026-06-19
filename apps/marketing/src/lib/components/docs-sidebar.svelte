<script lang="ts">
  import { cn } from "@repo/utils";
  import type { DocPage } from "$lib/docs";
  import { useMarketingLang, useMarketingT } from "$lib/marketing-context";
  import { localizedPath } from "$lib/locale-path";

  interface Props {
    docs: DocPage[];
    currentSlug?: string;
  }

  let { docs, currentSlug }: Props = $props();

  const t = useMarketingT();
  const lang = useMarketingLang();
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
