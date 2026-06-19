<script lang="ts">
  import { setMarketingContext } from "$lib/marketing-context";
  import type { Locale } from "$lib/i18n";
  import type { Snippet } from "svelte";

  interface Props {
    lang: Locale;
    children?: Snippet;
  }

  let { lang, children }: Props = $props();

  setMarketingContext(() => lang);
</script>

{@render children?.()}
