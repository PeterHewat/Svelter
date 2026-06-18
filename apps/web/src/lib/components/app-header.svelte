<script lang="ts">
  import { LanguageSwitcher, ThemeToggle } from "@repo/ui-svelte";
  import { cn } from "@repo/utils";
  import {
    iconButtonClass,
    iconSlotClass,
    navLinkClass,
    navSecondaryLinkClass,
    siteHeaderClass,
    siteNavClass,
  } from "@repo/utils/chrome";
  import { focusRing } from "@repo/utils/focus";
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
        {#if mode === "ready"}
          {#if ClerkHeader}
            <ClerkHeader part="nav" />
          {:else}
            <span
              class={cn(navSecondaryLinkClass, "invisible")}
              aria-hidden="true">{t("nav.tasks")}</span
            >
          {/if}
        {:else if mode === "loading"}
          <span
            class={cn(navSecondaryLinkClass, "invisible")}
            aria-hidden="true">{t("nav.tasks")}</span
          >
        {:else}
          <button
            type="button"
            class={cn(navSecondaryLinkClass, focusRing)}
            onclick={() => handleOpenAuth("/tasks")}
          >
            {t("nav.tasks")}
          </button>
        {/if}
      {/if}
    </div>
    <div class="flex items-center gap-2">
      <LanguageSwitcher ariaLabel={t("language.select")} />
      <ThemeToggle />
      {#if isAuthEnabled()}
        {#if mode === "ready"}
          {#if ClerkHeader}
            <ClerkHeader part="actions" />
          {:else}
            <div class={iconSlotClass}>
              <div class="h-10 w-10 shrink-0" aria-hidden="true"></div>
            </div>
          {/if}
        {:else if mode === "loading"}
          <div class={iconSlotClass}>
            <div class="h-10 w-10 shrink-0" aria-hidden="true"></div>
          </div>
        {:else}
          <div class={iconSlotClass}>
            <button
              type="button"
              class={iconButtonClass()}
              onclick={() => handleOpenAuth()}
              aria-haspopup="dialog"
              aria-label={t("auth.openAuth")}
              title={t("auth.openAuth")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5 shrink-0"
                aria-hidden="true"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" x2="3" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        {/if}
      {/if}
    </div>
  </nav>
</header>
