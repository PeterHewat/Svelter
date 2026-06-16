<script lang="ts">
  import { useTranslation } from "$lib/i18n";

  const { t } = useTranslation();
</script>

<div class="mx-auto max-w-lg text-center">
  <h1 class="mb-2 text-3xl font-bold">{t("errors.notFound")}</h1>
  <p class="text-muted-foreground mb-6">{t("errors.notFoundHint")}</p>
  <a href="/" class="text-primary underline">{t("nav.home")}</a>
</div>
