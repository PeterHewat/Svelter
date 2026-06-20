<script lang="ts">
  import { cn } from "@repo/utils";
  import {
    iconButtonClass,
    iconSlotClass,
    navSecondaryLinkClass,
  } from "@repo/utils/chrome";
  import { UserButton, useClerkContext } from "svelte-clerk/client";
  import { openAuthModal } from "$lib/auth-ui.svelte";
  import { useAppAuth } from "$lib/use-app-auth.svelte";
  import { useTranslation } from "$lib/i18n";

  interface Props {
    part: "nav" | "actions";
  }

  let { part }: Props = $props();

  const { t } = useTranslation();
  const auth = useAppAuth();
  const clerk = useClerkContext();
  const sessionKey = $derived(clerk.auth.userId ?? "signed-out");

  function handleOpenAuth(redirectTo?: string) {
    openAuthModal(redirectTo);
  }
</script>

{#key sessionKey}
  {#if part === "nav"}
    {#if auth.isLoading}
      <span class={cn(navSecondaryLinkClass, "invisible")} aria-hidden="true"
        >{t("nav.tasks")}</span
      >
    {:else}
      <a href="/tasks" class={navSecondaryLinkClass}>{t("nav.tasks")}</a>
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
{/key}
