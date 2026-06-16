<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { openAuthModal, takeAuthRedirect } from "$lib/auth-ui.svelte";
  import { isAuthEnabled } from "$lib/backend";
  import { useAppAuth } from "$lib/use-app-auth.svelte";

  const auth = useAppAuth();

  onMount(() => {
    if (!isAuthEnabled()) {
      void goto("/");
      return;
    }

    const redirect = page.url.searchParams.get("redirect");
    openAuthModal(redirect && redirect.startsWith("/") ? redirect : undefined);
    void goto("/", { replaceState: true });
  });

  $effect(() => {
    if (!auth.isAuthenticated) return;
    const redirect = takeAuthRedirect();
    if (redirect) void goto(redirect);
  });
</script>
