<script lang="ts">
  import { useTranslation } from "$lib/i18n";
  import { isBackendEnabled } from "$lib/backend";

  const { t } = useTranslation();
</script>

{#if !isBackendEnabled()}
  <section
    class="border-border bg-muted/40 mx-auto mt-8 max-w-lg rounded-lg border p-6 text-left"
  >
    <h2 class="mb-2 text-lg font-semibold">{t("backend.setupTitle")}</h2>
    <p class="text-muted-foreground mb-4 text-sm">{t("backend.setupBody")}</p>
    <ol class="text-muted-foreground list-decimal space-y-2 pl-5 text-sm">
      <li>{t("backend.stepConvex")}</li>
      <li>{t("backend.stepAuth")}</li>
      <li>{t("backend.stepEnv")}</li>
    </ol>
    <p class="text-muted-foreground mt-4 text-sm">{t("backend.setupGuide")}</p>
  </section>
{/if}
