<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { openAuthModal } from "$lib/auth-ui.svelte";
  import { isAuthEnabled } from "$lib/backend";
  import { useAppAuth } from "$lib/use-app-auth.svelte";

  let { children } = $props();

  onMount(() => {
    if (!isAuthEnabled()) {
      void goto("/");
    }
  });

  const auth = useAppAuth();

  $effect(() => {
    if (auth.isLoading || auth.isAuthenticated || !isAuthEnabled()) return;

    const pathname = page.url.pathname;
    // Home is the auth shell; do not reopen the modal here or we overwrite a deep-link redirect.
    if (pathname === "/") return;

    openAuthModal(pathname + page.url.search, { skipOneTap: true });
    void goto("/", { replaceState: true });
  });
</script>

{#if auth.isLoading}
  <p class="text-muted-foreground mt-24 text-center" role="status">Loading…</p>
{:else if auth.isAuthenticated}
  {@render children()}
{/if}
