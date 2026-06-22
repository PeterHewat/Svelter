<script lang="ts">
  import Section from "$lib/components/section.svelte";
  import ProductAppLink from "$lib/components/product-app-link.svelte";
  import { useMarketingT } from "$lib/marketing-context";

  const t = useMarketingT();
</script>

<Section class="marketing-section-y-compact" title={t("home.ctaTitle")}>
  <p
    class="text-muted-foreground mx-auto mb-8 max-w-2xl text-center text-lg leading-relaxed"
  >
    {t("home.ctaSubtitle")}
  </p>
  <div class="flex justify-center">
    <ProductAppLink
      class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 shrink-0 items-center rounded-lg px-4 text-sm font-medium transition-colors"
    >
      {t("home.ctaDashboard")}
    </ProductAppLink>
  </div>
</Section>
