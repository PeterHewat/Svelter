<script lang="ts">
  import DocsSidebar from "$lib/components/docs-sidebar.svelte";
  import type { DocPage } from "$lib/docs";
  import type { Locale } from "$lib/i18n";
  import type { Snippet } from "svelte";

  interface Props {
    lang: Locale;
    docs: DocPage[];
    currentSlug?: string;
    children?: Snippet;
  }

  let { lang, docs, currentSlug, children }: Props = $props();
</script>

<div class="marketing-container py-16 md:py-20">
  <div
    class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16"
  >
    <aside class="lg:sticky lg:top-24 lg:self-start">
      <DocsSidebar {lang} {docs} {currentSlug} />
    </aside>
    <div class="min-w-0">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>
</div>
