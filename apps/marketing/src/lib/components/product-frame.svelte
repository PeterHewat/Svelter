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
    "border-border bg-card w-full overflow-hidden rounded-2xl border shadow-sm",
    className,
  )}
>
  <div
    class="border-border bg-muted/40 flex items-center gap-2 border-b px-4 py-2"
    aria-hidden="true"
  >
    <span class="bg-muted-foreground/30 h-2 w-2 rounded-full"></span>
    <span class="bg-muted-foreground/30 h-2 w-2 rounded-full"></span>
    <span class="bg-muted-foreground/30 h-2 w-2 rounded-full"></span>
    <span class="text-muted-foreground ml-2 truncate text-xs font-medium"
      >app.example.com</span
    >
  </div>
  <div
    class="bg-muted/20 relative flex aspect-16/10 items-center justify-center"
    role="img"
    aria-label={screenshotAlt}
  >
    {#if children}
      {@render children()}
    {:else}
      <div
        class="from-accent/40 to-muted/60 h-full w-full bg-linear-to-br"
      ></div>
    {/if}
  </div>
</div>
