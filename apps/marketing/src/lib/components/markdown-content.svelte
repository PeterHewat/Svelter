<script lang="ts">
  import { cn } from "@repo/utils";

  interface Props {
    html: string;
    class?: string;
  }

  let { html, class: className }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time authored Markdown only -->
<div class={cn("prose-marketing", className)}>{@html html}</div>
