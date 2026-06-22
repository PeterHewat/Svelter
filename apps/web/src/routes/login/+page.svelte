<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { openAuthModal } from "$lib/auth-ui.svelte";
  import { isAuthEnabled } from "$lib/backend";

  onMount(() => {
    if (!isAuthEnabled()) {
      void goto("/");
      return;
    }

    const redirect = page.url.searchParams.get("redirect");
    openAuthModal(redirect && redirect.startsWith("/") ? redirect : undefined, {
      skipOneTap: true,
    });
    void goto("/", { replaceState: true });
  });
</script>
