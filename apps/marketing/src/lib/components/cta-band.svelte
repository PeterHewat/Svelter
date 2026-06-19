<script lang="ts">
  import Section from "$lib/components/section.svelte";
  import { useMarketingT } from "$lib/marketing-context";

  const t = useMarketingT();
</script>

<Section class="marketing-section-y-compact" title={t("home.ctaTitle")}>
  <p
    class="text-muted-foreground mx-auto max-w-2xl text-center text-lg leading-relaxed"
  >
    {t("home.ctaSubtitle")}
  </p>
</Section>
