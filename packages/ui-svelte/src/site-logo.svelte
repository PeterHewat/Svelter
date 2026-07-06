<script lang="ts">
  import { cn } from "@repo/utils";
  import { navLinkClass } from "@repo/utils/chrome";

  interface Props {
    href: string;
    name: string;
    class?: string;
    /** Extra classes for the visible site name (e.g. responsive hide below a breakpoint). */
    nameClass?: string;
    /** Logo image — use a resolution at or above the displayed size (`h-* w-*`). */
    logoSrc?: string;
    element?: HTMLElement | null;
  }

  let {
    href,
    name,
    class: className,
    nameClass,
    logoSrc = "/logo.png",
    element = $bindable(null),
  }: Props = $props();
</script>

<a
  bind:this={element}
  {href}
  aria-label={name}
  class={cn("inline-flex shrink-0 items-center gap-2", navLinkClass, className)}
  data-site-home-link
>
  <img
    src={logoSrc}
    alt=""
    width="32"
    height="32"
    class="h-8 w-8 shrink-0"
    decoding="async"
    aria-hidden="true"
  />
  <span class={cn("text-lg", nameClass)} aria-hidden="true">{name}</span>
</a>
