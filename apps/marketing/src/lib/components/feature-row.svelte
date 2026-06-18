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

<div
  class={cn(
    "grid items-center gap-10 md:grid-cols-2 md:gap-16",
    reversed && "md:[&>*:first-child]:order-2",
  )}
>
  <div>
    <h3 class="mb-4 text-2xl font-bold tracking-tight">{row.title}</h3>
    <p class="text-muted-foreground leading-relaxed">{row.body}</p>
  </div>
  <ProductFrame screenshotAlt={row.imageLabel}>
    <div
      class="text-muted-foreground flex h-full w-full items-center justify-center p-6 text-center text-sm"
    >
      {row.imageLabel}
    </div>
  </ProductFrame>
</div>
