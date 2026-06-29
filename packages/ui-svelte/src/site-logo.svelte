<script lang="ts">
  import { cn } from "@repo/utils";
  import { navLinkClass } from "@repo/utils/chrome";

  interface Props {
    href: string;
    name: string;
    class?: string;
    logoSrc?: string;
    element?: HTMLElement | null;
  }

  let {
    href,
    name,
    class: className,
    logoSrc = "/logo.png",
    element = $bindable(null),
  }: Props = $props();
</script>

<a
  bind:this={element}
  {href}
  class={cn("inline-flex shrink-0 items-center gap-2", navLinkClass, className)}
  data-site-home-link
>
  <img
    src={logoSrc}
    alt=""
    width="32"
    height="32"
    class="h-8 w-8 shrink-0"
    aria-hidden="true"
  />
  <span class="text-lg">{name}</span>
</a>
