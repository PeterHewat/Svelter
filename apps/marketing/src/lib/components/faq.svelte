<script lang="ts">
  import Reveal from "$lib/components/reveal.svelte";
  import Section from "$lib/components/section.svelte";
  import type { MarketingTranslationKey } from "$lib/i18n";
  import { useMarketingT } from "$lib/marketing-context";
  import type { FaqItem } from "$lib/marketing-content";
  import { marketingContent } from "$lib/marketing-content";

  interface Props {
    /** FAQ items — defaults to homepage FAQ. */
    items?: readonly FaqItem[];
    /** i18n key for section title. */
    titleKey?: MarketingTranslationKey;
    /** Emit FAQPage JSON-LD (homepage only). */
    jsonLd?: boolean;
  }

  let {
    items = marketingContent.faq,
    titleKey = "home.faqTitle",
    jsonLd = false,
  }: Props = $props();

  const t = useMarketingT();

  const questionItems = $derived(
    items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  );

  const faqJsonLd = $derived(
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: questionItems,
    }),
  );

  const faqJsonLdScript = $derived(
    jsonLd && faqJsonLd
      ? `<script type="application/ld+json">${faqJsonLd.replace(/</g, "\\u003c")}<` +
          `/script>`
      : "",
  );
</script>

<svelte:head>
  {#if faqJsonLdScript}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted FAQ JSON-LD; `<` escaped -->
    {@html faqJsonLdScript}
  {/if}
</svelte:head>

<Section id="faq" title={t(titleKey)}>
  <div class="mx-auto max-w-3xl space-y-10">
    {#each items as item, index (item.question)}
      <Reveal delay={index * 60}>
        <div>
          <h3 class="text-foreground text-lg font-semibold">{item.question}</h3>
          <p class="text-muted-foreground mt-2 leading-relaxed">
            {item.answer}
          </p>
        </div>
      </Reveal>
    {/each}
  </div>
</Section>
