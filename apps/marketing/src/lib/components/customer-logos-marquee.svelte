<script lang="ts">
  import { cn } from "@repo/utils";
  import { useMarketingT } from "$lib/marketing-context";
  import type { CustomerLogo } from "$lib/marketing-content";

  type Props = {
    class?: string;
    logos: readonly CustomerLogo[];
  };

  let { class: className, logos }: Props = $props();

  const t = useMarketingT();
  const titleId = "customer-logos-title";
</script>

<div class={cn("mt-16", className)}>
  <p
    id={titleId}
    class="text-muted-foreground mb-8 text-center text-sm font-medium tracking-wide uppercase"
  >
    {t("home.customerLogosTitle")}
  </p>

  <div class="marketing-logo-marquee" role="region" aria-labelledby={titleId}>
    <div class="marketing-logo-marquee-mask overflow-hidden">
      <div class="marketing-logo-marquee-track flex w-max">
        {#each [0, 1] as copy (copy)}
          <ul
            class="marketing-logo-marquee-group flex shrink-0 items-center"
            role="list"
            aria-hidden={copy === 1 ? "true" : undefined}
          >
            {#each logos as logo (`${copy}-${logo.name}`)}
              <li class="flex shrink-0 items-center justify-center px-8">
                {#if logo.imageSrc}
                  <img
                    src={logo.imageSrc}
                    alt={logo.name}
                    class="h-8 w-auto max-w-[8rem] object-contain opacity-80 grayscale transition-opacity hover:opacity-100"
                    loading="lazy"
                    decoding="async"
                  />
                {:else}
                  <!-- Placeholder logo — replace in v1 -->
                  <span
                    class="border-border text-muted-foreground flex h-10 w-[8rem] items-center justify-center rounded-md border border-dashed px-2 text-center text-xs font-semibold"
                    title="Placeholder logo — replace in v1"
                  >
                    {logo.name}
                  </span>
                {/if}
              </li>
            {/each}
          </ul>
        {/each}
      </div>
    </div>
  </div>
</div>
