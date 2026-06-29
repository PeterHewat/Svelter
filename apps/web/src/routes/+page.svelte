<script lang="ts">
  import { useTranslation } from "$lib/i18n";
  import BackendSetup from "$lib/components/backend-setup.svelte";
  import { isAuthEnabled } from "$lib/backend";
  import { marketingHomeHref } from "$lib/marketing-link";
  import { useThemeStore } from "@repo/utils/theme";
  import { focusRing } from "@repo/utils/focus";

  const { t, locale } = useTranslation();
  const themeStore = useThemeStore;
  let linkTheme = $state(themeStore.getState().resolvedTheme);

  $effect(() => {
    return themeStore.subscribe((state) => {
      linkTheme = state.resolvedTheme;
    });
  });

  const marketingUrl = $derived(
    marketingHomeHref(locale, { theme: linkTheme }),
  );
</script>

<div class="mx-auto max-w-xl space-y-4 text-left text-sm">
  <h1 class="sr-only">{t("home.title")}</h1>

  <p class="text-muted-foreground">
    {t("home.introBeforeSetup")}<code class="font-mono text-xs"
      >bun run setup</code
    >{t("home.introAfterSetup")}
  </p>

  <BackendSetup />

  {#if isAuthEnabled()}
    <p class="text-muted-foreground">
      <a href="/tasks" class="text-primary underline {focusRing}">/tasks</a>{t(
        "home.tasksNote",
      )}
    </p>
    <p class="text-muted-foreground">
      <a href="/user" class="text-primary underline {focusRing}">/user</a>{t(
        "home.userNote",
      )}
    </p>
  {/if}

  <p>
    <a href={marketingUrl} class="text-primary underline {focusRing}">
      {t("home.marketingLink")}
    </a>
  </p>
</div>
