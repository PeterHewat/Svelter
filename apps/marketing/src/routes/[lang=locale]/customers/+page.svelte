<script lang="ts">
  import TemplateStubPage from "$lib/components/template-stub-page.svelte";
  import type { Locale } from "$lib/i18n";
  import { marketingContent } from "$lib/marketing-content";

  let { data } = $props();

  const lang = $derived(data.lang as Locale);
  const stub = marketingContent.stubs.customers;
</script>

<TemplateStubPage
  {lang}
  titleKey="pages.customers.title"
  descriptionKey="meta.customersDescription"
  paragraphs={[stub.intro]}
/>
