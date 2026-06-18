<script lang="ts">
  import { cn } from "@repo/utils";
  import type { Snippet } from "svelte";

  type Props = {
    class?: string;
    screenshotAlt?: string;
    children?: Snippet;
  };

  let {
    class: className,
    screenshotAlt = "Product screenshot",
    children,
  }: Props = $props();
</script>

<div
  class={cn(
    "border-border bg-card overflow-hidden rounded-xl border shadow-lg",
    className,
  )}
>
  <div
    class="border-border bg-muted/60 flex items-center gap-2 border-b px-4 py-2.5"
    aria-hidden="true"
  >
    <span class="bg-muted-foreground/40 h-2.5 w-2.5 rounded-full"></span>
    <span class="bg-muted-foreground/40 h-2.5 w-2.5 rounded-full"></span>
    <span class="bg-muted-foreground/40 h-2.5 w-2.5 rounded-full"></span>
    <span class="text-muted-foreground ml-2 truncate text-xs"
      >app.example.com</span
    >
  </div>
  <div
    class="bg-muted/30 relative flex aspect-video items-center justify-center"
    role="img"
    aria-label={screenshotAlt}
  >
    {#if children}
      {@render children()}
    {:else}
      <div
        class="from-primary/15 to-muted h-full w-full bg-gradient-to-br"
      ></div>
    {/if}
  </div>
</div>
