<script lang="ts">
  import Section from "$lib/components/section.svelte";
  import { mt, type Locale } from "$lib/i18n";
  import type { FaqItem } from "$lib/marketing-content";
  import { marketingContent } from "$lib/marketing-content";

  interface Props {
    lang: Locale;
    /** FAQ items — defaults to homepage FAQ. */
    items?: readonly FaqItem[];
    /** i18n key for section title. */
    titleKey?: Parameters<typeof mt>[0];
    /** Emit FAQPage JSON-LD (homepage only). */
    jsonLd?: boolean;
  }

  let {
    lang,
    items = marketingContent.faq,
    titleKey = "home.faqTitle",
    jsonLd = false,
  }: Props = $props();

  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );

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

<Section title={t(titleKey)} class="bg-muted/30">
  <div class="mx-auto max-w-3xl divide-y rounded-xl border">
    {#each items as item, index (item.question)}
      <details class="group px-6 py-4" open={index === 0}>
        <summary
          class="cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden"
        >
          <span class="flex items-center justify-between gap-4">
            {item.question}
            <span
              class="text-muted-foreground shrink-0 text-xl leading-none group-open:rotate-45"
              aria-hidden="true">+</span
            >
          </span>
        </summary>
        <p class="text-muted-foreground mt-3 pr-8 text-sm leading-relaxed">
          {item.answer}
        </p>
      </details>
    {/each}
  </div>
</Section>
