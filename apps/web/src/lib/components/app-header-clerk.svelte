<script lang="ts">
  import { cn } from "@repo/utils";
  import { navSecondaryLinkClass } from "@repo/utils/chrome";
  import AuthAccountClerkButton from "$lib/components/auth-account-clerk-button.svelte";
  import { openAuthModal } from "$lib/auth-ui.svelte";
  import { useAppAuth } from "$lib/use-app-auth.svelte";
  import { useTranslation } from "$lib/i18n";

  interface Props {
    part: "nav" | "actions";
  }

  let { part }: Props = $props();

  const { t } = useTranslation();
  const auth = useAppAuth();

  function handleOpenAuth(redirectTo?: string) {
    openAuthModal(redirectTo);
  }
</script>

{#if part === "nav"}
  {#if auth.isLoading}
    <span class={cn(navSecondaryLinkClass, "invisible")} aria-hidden="true"
      >{t("nav.tasks")}</span
    >
    <span class={cn(navSecondaryLinkClass, "invisible")} aria-hidden="true"
      >{t("nav.user")}</span
    >
  {:else}
    <a href="/tasks" class={navSecondaryLinkClass}>{t("nav.tasks")}</a>
    <a href="/user" class={navSecondaryLinkClass}>{t("nav.user")}</a>
  {/if}
{:else}
  <AuthAccountClerkButton
    ariaLabel={auth.isLoading ? t("common.loading") : t("auth.openAuth")}
    onclick={() => handleOpenAuth()}
  />
{/if}
