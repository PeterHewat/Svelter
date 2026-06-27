<script lang="ts">
  import { LanguageSwitcher, ThemeToggle } from "@repo/ui-svelte";
  import { cn } from "@repo/utils";
  import {
    navLinkClass,
    navSecondaryLinkClass,
    siteHeaderClass,
    siteNavClass,
  } from "@repo/utils/chrome";
  import AuthAccountButton from "$lib/components/auth-account-button.svelte";
  import { openAuthModal } from "$lib/auth-ui.svelte";
  import { isAuthEnabled } from "$lib/backend";
  import { useTranslation } from "$lib/i18n";

  type HeaderMode = "anonymous" | "loading" | "ready";

  interface Props {
    mode: HeaderMode;
  }

  let { mode }: Props = $props();

  const { t } = useTranslation();

  let ClerkHeader = $state<
    typeof import("$lib/components/app-header-clerk.svelte").default | null
  >(null);

  const authNavPlaceholder = $derived(
    mode === "loading" || (mode === "ready" && !ClerkHeader),
  );

  const authActionLoading = $derived(
    mode === "loading" || (mode === "ready" && ClerkHeader === null),
  );

  function handleOpenAuth(redirectTo?: string) {
    openAuthModal(redirectTo);
  }

  $effect(() => {
    if (mode !== "ready") {
      ClerkHeader = null;
      return;
    }
    let cancelled = false;
    void import("$lib/components/app-header-clerk.svelte").then((module) => {
      if (!cancelled) ClerkHeader = module.default;
    });
    return () => {
      cancelled = true;
    };
  });
</script>

<header class={siteHeaderClass}>
  <nav class={siteNavClass} aria-label={t("nav.main")}>
    <div class="flex items-center gap-4">
      <a href="/" class={cn("text-lg", navLinkClass)}>{t("home.title")}</a>
      {#if isAuthEnabled()}
        {#if mode === "ready" && ClerkHeader}
          <ClerkHeader part="nav" />
        {:else if authNavPlaceholder}
          <span
            class={cn(navSecondaryLinkClass, "invisible")}
            aria-hidden="true">{t("nav.tasks")}</span
          >
          <span
            class={cn(navSecondaryLinkClass, "invisible")}
            aria-hidden="true">{t("nav.user")}</span
          >
        {:else}
          <a href="/tasks" class={navSecondaryLinkClass}>{t("nav.tasks")}</a>
          <a href="/user" class={navSecondaryLinkClass}>{t("nav.user")}</a>
        {/if}
      {/if}
    </div>
    <div class="flex items-center gap-2">
      <LanguageSwitcher ariaLabel={t("language.select")} />
      <ThemeToggle
        labels={{
          switchToLight: t("theme.switchToLight"),
          switchToDark: t("theme.switchToDark"),
          switchToLightAria: t("theme.switchToLightAria"),
          switchToDarkAria: t("theme.switchToDarkAria"),
        }}
      />
      {#if isAuthEnabled()}
        {#if mode === "ready" && ClerkHeader}
          <ClerkHeader part="actions" />
        {:else}
          <AuthAccountButton
            loading={authActionLoading}
            ariaLabel={authActionLoading
              ? t("common.loading")
              : t("auth.openAuth")}
            onclick={() => handleOpenAuth()}
          />
        {/if}
      {/if}
    </div>
  </nav>
</header>
