<script lang="ts">
  import { cn } from "@repo/utils";
  import type { Snippet } from "svelte";

  type Props = {
    class?: string;
    /** Element to render — use `li` inside lists for valid markup. */
    as?: "div" | "li" | "article" | "section";
    /** Stagger delay in milliseconds when the element enters the viewport. */
    delay?: number;
    children?: Snippet;
  };

  let { class: className, as: tag = "div", delay, children }: Props = $props();
</script>

<svelte:element
  this={tag}
  class={cn(className)}
  data-reveal
  data-reveal-delay={delay !== undefined ? String(delay) : undefined}
>
  {@render children?.()}
</svelte:element>
