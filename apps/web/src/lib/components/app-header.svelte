<script lang="ts">
  import { LanguageSwitcher, ThemeToggle } from "@repo/ui-svelte";
  import { cn } from "@repo/utils";
  import { UserButton } from "svelte-clerk/client";
  import {
    authModal,
    openAuthModal,
    setAuthModalAnchor,
  } from "$lib/auth-ui.svelte";
  import { isAuthEnabled } from "$lib/backend";
  import { useAppAuth } from "$lib/use-app-auth.svelte";
  import { focusRing } from "$lib/focus";
  import { useTranslation } from "$lib/i18n";

  const { t } = useTranslation();
  const auth = useAppAuth();

  let signInButton = $state<HTMLButtonElement | null>(null);

  const navLinkClass = "text-foreground hover:text-primary font-semibold";

  const tasksNavClass =
    "text-muted-foreground hover:text-primary cursor-pointer text-sm";

  const iconButtonClass = cn(
    "border-border bg-background text-foreground inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border",
    "hover:bg-secondary hover:text-secondary-foreground",
    focusRing,
  );

  function handleOpenAuth(redirectTo?: string) {
    if (signInButton) setAuthModalAnchor(signInButton);
    openAuthModal(redirectTo);
  }

  $effect(() => {
    if (!authModal.open || !signInButton) return;

    const updateAnchor = () => setAuthModalAnchor(signInButton);
    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);
    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  });
</script>

<header
  class="border-border bg-background/80 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-sm"
>
  <nav
    class="container mx-auto flex items-center justify-between px-4 py-3"
    aria-label={t("nav.main")}
  >
    <div class="flex items-center gap-4">
      <a href="/" class={cn("text-lg", navLinkClass)}>{t("home.title")}</a>
      {#if isAuthEnabled()}
        {#if auth.isLoading}
          <span class={cn(tasksNavClass, "invisible")} aria-hidden="true"
            >{t("nav.tasks")}</span
          >
        {:else if auth.isAuthenticated}
          <a href="/tasks" class={tasksNavClass}>{t("nav.tasks")}</a>
        {:else}
          <button
            type="button"
            class={cn(tasksNavClass, focusRing)}
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
        <div class="flex h-10 w-10 shrink-0 items-center justify-center">
          {#if auth.isLoading}
            <div class="h-10 w-10 shrink-0" aria-hidden="true"></div>
          {:else if auth.isAuthenticated}
            <UserButton />
          {:else}
            <button
              bind:this={signInButton}
              type="button"
              class={iconButtonClass}
              onclick={() => handleOpenAuth()}
              aria-expanded={authModal.open}
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
          {/if}
        </div>
      {/if}
    </div>
  </nav>
</header>
