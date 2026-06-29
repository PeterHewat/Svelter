<script lang="ts">
  import AuthAccountClerkButton from "$lib/components/auth-account-clerk-button.svelte";
  import { openAuthModal } from "$lib/auth-ui.svelte";
  import { useAppAuth } from "$lib/use-app-auth.svelte";
  import { useTranslation } from "$lib/i18n";

  const { t } = useTranslation();
  const auth = useAppAuth();

  function handleOpenAuth(redirectTo?: string) {
    openAuthModal(redirectTo);
  }
</script>

<AuthAccountClerkButton
  ariaLabel={auth.isLoading ? t("common.loading") : t("auth.openAuth")}
  onclick={() => handleOpenAuth()}
/>
