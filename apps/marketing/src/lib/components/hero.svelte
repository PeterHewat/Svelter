<script lang="ts">
  import ProductFrame from "$lib/components/product-frame.svelte";
  import { useMarketingT } from "$lib/marketing-context";
  import { SITE_NAME } from "$lib/site";

  const t = useMarketingT();
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
        {t("home.heroTagline")}
      </p>
      <p class="text-muted-foreground mt-4 text-sm">
        {t("home.heroMicrocopy")}
      </p>
    </div>

    <div class="marketing-media mt-14">
      <ProductFrame
        class="shadow-black/5 shadow-2xl"
        screenshotAlt={t("home.heroScreenshotAlt")}
      />
    </div>
  </div>
</section>
