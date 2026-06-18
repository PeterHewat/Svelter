<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    authModal,
    clearAuthModalPending,
    openAuthModal,
  } from "$lib/auth-ui.svelte";
  import { isAuthEnabled } from "$lib/backend";
  import { hasAuthLoginParam } from "$lib/clerk-routes";
  import { useClerkContext } from "svelte-clerk/client";

  const clerk = useClerkContext();

  function resolveRedirectPath(redirectTo: string | null): string {
    if (redirectTo?.startsWith("/")) return redirectTo;
    const current = page.url.pathname + page.url.search;
    return current.startsWith("/") ? current : "/";
  }

  $effect(() => {
    if (!isAuthEnabled()) return;
    if (!hasAuthLoginParam(page.url.searchParams)) return;

    const redirect = page.url.searchParams.get("redirect");
    openAuthModal(redirect && redirect.startsWith("/") ? redirect : undefined);
  });

  $effect(() => {
    if (!authModal.pending || !clerk.isLoaded || !clerk.clerk) return;

    const redirectTo = resolveRedirectPath(authModal.redirectTo);
    clearAuthModalPending();

    if (clerk.auth.userId) {
      void goto(redirectTo);
      return;
    }

    void clerk.clerk.openSignIn({ fallbackRedirectUrl: redirectTo });
  });
</script>
