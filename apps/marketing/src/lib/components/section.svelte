<script lang="ts">
  import { cn } from "@repo/utils";
  import Reveal from "$lib/components/reveal.svelte";
  import type { Snippet } from "svelte";

  type Props = {
    class?: string;
    title?: string;
    id?: string;
    children?: Snippet;
  };

  let { class: className, title, id, children }: Props = $props();
</script>

<section
  {id}
  class={cn("marketing-section-y", id && "scroll-mt-24", className)}
>
  <div class="marketing-container">
    {#if title}
      <Reveal>
        <h2
          class="marketing-section-title mb-8 text-center font-semibold tracking-tight text-balance"
        >
          {title}
        </h2>
      </Reveal>
    {/if}
    {#if children}
      {@render children()}
    {/if}
  </div>
</section>
