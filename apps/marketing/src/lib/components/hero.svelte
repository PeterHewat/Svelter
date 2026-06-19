<script lang="ts">
  import ProductFrame from "$lib/components/product-frame.svelte";
  import { mt, type Locale } from "$lib/i18n";
  import { marketingContent } from "$lib/marketing-content";
  import { SITE_NAME, SITE_TAGLINE } from "$lib/site";

  interface Props {
    lang: Locale;
  }

  let { lang }: Props = $props();

  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
</script>

<section class="marketing-hero">
  <div class="marketing-container">
    <div class="mx-auto max-w-3xl text-center">
      <h1
        class="marketing-display mb-5 font-semibold tracking-tight text-balance"
      >
        {t("home.heroTitle", { name: SITE_NAME })}
      </h1>
      <p
        class="marketing-lead text-muted-foreground mx-auto max-w-2xl leading-relaxed text-balance"
      >
        {SITE_TAGLINE}
      </p>
      <p class="text-muted-foreground mt-4 text-sm">
        {t("home.heroMicrocopy")}
      </p>
    </div>

    <div class="marketing-media mt-14">
      <ProductFrame
        class="shadow-black/5 shadow-2xl"
        screenshotAlt={marketingContent.hero.screenshotAlt}
      />
    </div>
  </div>
</section>
