<script lang="ts">
  import ProductAppLink from "$lib/components/product-app-link.svelte";
  import { mt, type Locale } from "$lib/i18n";
  import { marketingContent } from "$lib/marketing-content";

  interface Props {
    lang: Locale;
  }

  let { lang }: Props = $props();

  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
</script>

<section class="bg-primary text-primary-foreground py-16 md:py-20">
  <div class="container mx-auto px-4 text-center">
    <h2 class="mb-4 text-3xl font-bold tracking-tight">
      {marketingContent.ctaBand.title}
    </h2>
    <p class="mx-auto mb-8 max-w-2xl text-lg opacity-90">
      {marketingContent.ctaBand.subtitle}
    </p>
    <ProductAppLink
      kind="signup"
      utmCampaign="cta-band"
      class="text-primary inline-flex h-11 items-center rounded-md bg-white px-6 text-base font-semibold hover:bg-gray-100"
    >
      {t("home.heroCta")}
    </ProductAppLink>
  </div>
</section>
