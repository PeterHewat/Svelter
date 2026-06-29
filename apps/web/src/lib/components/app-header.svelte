<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    LanguageSwitcher,
    SiteLogo,
    SiteNavLinks,
    ThemeToggle,
  } from "@repo/ui-svelte";
  import { siteHeaderClass } from "@repo/utils/chrome";
  import AuthAccountButton from "$lib/components/auth-account-button.svelte";
  import { getAppNavLinks } from "$lib/app-nav-links";
  import { openAuthModal } from "$lib/auth-ui.svelte";
  import { isAuthEnabled } from "$lib/backend";
  import { useTranslation } from "$lib/i18n";

  type HeaderMode = "anonymous" | "loading" | "ready";

  interface Props {
    mode: HeaderMode;
  }

  let { mode }: Props = $props();

  let homeLinkEl = $state<HTMLElement | null>(null);

  const { t } = useTranslation();

  let ClerkAuthButton = $state<
    typeof import("$lib/components/app-header-clerk.svelte").default | null
  >(null);

  const authActionLoading = $derived(
    mode === "loading" || (mode === "ready" && ClerkAuthButton === null),
  );

  const navLinks = $derived(getAppNavLinks(page.url.pathname, t));

  function handleOpenAuth(redirectTo?: string) {
    openAuthModal(redirectTo);
  }

  $effect(() => {
    if (mode !== "ready" || !isAuthEnabled()) {
      ClerkAuthButton = null;
      return;
    }
    let cancelled = false;
    void import("$lib/components/app-header-clerk.svelte").then((module) => {
      if (!cancelled) ClerkAuthButton = module.default;
    });
    return () => {
      cancelled = true;
    };
  });
</script>

<header class={siteHeaderClass}>
  <nav
    class="flex w-full items-center gap-2 px-4 py-3 sm:px-6"
    aria-label={t("nav.main")}
  >
    <div class="flex min-w-0 items-center gap-3">
      <SiteLogo href="/" name={t("home.title")} bind:element={homeLinkEl} />
      {#if isAuthEnabled()}
        <SiteNavLinks
          links={navLinks}
          homeLink={homeLinkEl}
          onNavigateHome={(href) => goto(href)}
        />
      {/if}
    </div>

    <div class="ml-auto flex shrink-0 items-center gap-2">
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
        {#if mode === "ready" && ClerkAuthButton}
          <ClerkAuthButton />
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
