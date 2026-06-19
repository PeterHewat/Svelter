<script lang="ts">
  import { cn } from "@repo/utils";
  import ProductFrame from "$lib/components/product-frame.svelte";
  import type { FeatureRowContent } from "$lib/marketing-content";

  type Props = {
    row: FeatureRowContent;
    reversed?: boolean;
  };

  let { row, reversed = false }: Props = $props();
</script>

<article id={row.slug} class="scroll-mt-24">
  <div class="grid items-center gap-10 md:grid-cols-2 md:gap-20">
    <div class={cn(reversed && "md:order-2")}>
      <h3 class="mb-4 text-2xl font-semibold tracking-tight text-balance">
        {row.title}
      </h3>
      <p class="text-muted-foreground text-lg leading-relaxed">{row.body}</p>
      {#if row.bullets && row.bullets.length > 0}
        <ul class="text-muted-foreground mt-6 space-y-2" role="list">
          {#each row.bullets as bullet (bullet)}
            <li class="flex gap-3">
              <span
                class="bg-primary mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                aria-hidden="true"
              ></span>
              <span>{bullet}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <div class={cn(reversed && "md:order-1")}>
      <ProductFrame screenshotAlt={row.imageLabel}>
        <div
          class="text-muted-foreground flex h-full w-full items-center justify-center p-6 text-center text-sm"
        >
          {row.imageLabel}
        </div>
      </ProductFrame>
    </div>
  </div>
</article>
