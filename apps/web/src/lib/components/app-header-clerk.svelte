<script lang="ts">
  import { cn } from "@repo/utils";
  import {
    iconButtonClass,
    iconSlotClass,
    navSecondaryLinkClass,
  } from "@repo/utils/chrome";
  import { focusRing } from "@repo/utils/focus";
  import { UserButton } from "svelte-clerk/client";
  import {
    authModal,
    openAuthModal,
    setAuthModalAnchor,
  } from "$lib/auth-ui.svelte";
  import { useAppAuth } from "$lib/use-app-auth.svelte";
  import { useTranslation } from "$lib/i18n";

  interface Props {
    part: "nav" | "actions";
  }

  let { part }: Props = $props();

  const { t } = useTranslation();
  const auth = useAppAuth();

  let signInButton = $state<HTMLButtonElement | null>(null);

  function handleOpenAuth(redirectTo?: string) {
    if (signInButton) setAuthModalAnchor(signInButton);
    openAuthModal(redirectTo);
  }

  $effect(() => {
    if (part !== "actions") return;
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

{#if part === "nav"}
  {#if auth.isLoading}
    <span class={cn(navSecondaryLinkClass, "invisible")} aria-hidden="true"
      >{t("nav.tasks")}</span
    >
  {:else if auth.isAuthenticated}
    <a href="/tasks" class={navSecondaryLinkClass}>{t("nav.tasks")}</a>
  {:else}
    <button
      type="button"
      class={cn(navSecondaryLinkClass, focusRing)}
      onclick={() => handleOpenAuth("/tasks")}
    >
      {t("nav.tasks")}
    </button>
  {/if}
{:else if auth.isLoading}
  <div class={iconSlotClass}>
    <div class="h-10 w-10 shrink-0" aria-hidden="true"></div>
  </div>
{:else if auth.isAuthenticated}
  <div class={iconSlotClass}>
    <UserButton />
  </div>
{:else}
  <div class={iconSlotClass}>
    <button
      bind:this={signInButton}
      type="button"
      class={iconButtonClass()}
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
  </div>
{/if}
