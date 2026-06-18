<script lang="ts">
  import Section from "$lib/components/section.svelte";
  import { marketingContent } from "$lib/marketing-content";
</script>

<Section class="border-border border-b py-12 md:py-16">
  <p
    class="text-muted-foreground mb-8 text-center text-sm font-medium tracking-wide uppercase"
  >
    {marketingContent.logoBar.tagline}
  </p>
  <ul
    class="mx-auto grid max-w-4xl grid-cols-2 items-center gap-8 sm:grid-cols-3 md:grid-cols-5"
    role="list"
  >
    {#each marketingContent.logoBar.logos as logo (logo.name)}
      <li class="flex justify-center">
        <!-- Placeholder logo — replace in v1 -->
        <span
          class="border-border text-muted-foreground flex h-10 w-full max-w-[8rem] items-center justify-center rounded-md border border-dashed px-2 text-center text-xs font-semibold"
          title="Placeholder logo — replace in v1"
        >
          {logo.name}
        </span>
      </li>
    {/each}
  </ul>
</Section>
