<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { openAuthModal } from "$lib/auth-ui.svelte";
  import { requestClerkLoad } from "$lib/clerk-load.svelte";
  import { isAuthEnabled } from "$lib/backend";

  onMount(() => {
    if (!isAuthEnabled()) {
      void goto("/");
      return;
    }

    const redirect = page.url.searchParams.get("redirect");
    requestClerkLoad();
    openAuthModal(redirect && redirect.startsWith("/") ? redirect : undefined);
    void goto("/", { replaceState: true });
  });
</script>
