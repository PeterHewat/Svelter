<script lang="ts">
  import TemplateStubPage from "$lib/components/template-stub-page.svelte";
  import { marketingContent } from "$lib/marketing-content";
  import {
    marketingStubPages,
    type MarketingStubId,
  } from "$lib/marketing-stubs";
  import type { Snippet } from "svelte";

  interface Props {
    stubId: MarketingStubId;
    children?: Snippet;
  }

  let { stubId, children }: Props = $props();

  const config = $derived(marketingStubPages[stubId]);
  const paragraphs = $derived([
    marketingContent.stubs[config.contentKey].intro,
  ]);
</script>

<TemplateStubPage
  titleKey={config.titleKey}
  descriptionKey={config.descriptionKey}
  {paragraphs}
>
  {@render children?.()}
</TemplateStubPage>
