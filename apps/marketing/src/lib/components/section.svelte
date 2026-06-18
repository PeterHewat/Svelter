<script lang="ts">
  import { cn } from "@repo/utils";
  import type { Snippet } from "svelte";

  type Props = {
    class?: string;
    title?: string;
    id?: string;
    children?: Snippet;
  };

  let { class: className, title, id, children }: Props = $props();
</script>

<section {id} class={cn("py-16 md:py-24", className)}>
  <div class="container mx-auto px-4">
    {#if title}
      <h2 class="mb-12 text-center text-3xl font-bold tracking-tight">
        {title}
      </h2>
    {/if}
    {#if children}
      {@render children()}
    {/if}
  </div>
</section>
