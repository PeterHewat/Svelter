<script lang="ts">
  import { cn } from "@repo/utils";
  import {
    productAppHref,
    type ProductAppHrefOptions,
    type ProductLinkKind,
  } from "$lib/product-links";
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type Props = Omit<HTMLAnchorAttributes, "href" | "class"> & {
    class?: string;
    kind?: ProductLinkKind;
    utmCampaign?: ProductAppHrefOptions["utmCampaign"];
    children?: Snippet;
  };

  let {
    kind = "signup",
    utmCampaign,
    class: className,
    children,
    ...rest
  }: Props = $props();

  const href = $derived(productAppHref({ kind, utmCampaign }));
</script>

<a
  {href}
  class={cn(className)}
  rel="noopener noreferrer"
  target="_blank"
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</a>
