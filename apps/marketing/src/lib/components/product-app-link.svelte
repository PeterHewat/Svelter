<script lang="ts">
  import { cn } from "@repo/utils";
  import type { Locale } from "$lib/i18n";
  import { productAppHref } from "$lib/product-links";
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type Props = Omit<HTMLAnchorAttributes, "href" | "class"> & {
    class?: string;
    lang?: Locale;
    children?: Snippet;
  };

  let { lang, class: className, children, ...rest }: Props = $props();

  const href = $derived(productAppHref({ lang }));
</script>

<a
  {href}
  class={cn(className)}
  data-product-app-link
  data-lang={lang}
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</a>
