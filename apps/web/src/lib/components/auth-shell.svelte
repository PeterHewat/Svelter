<script lang="ts">
  import { ClerkProvider } from "svelte-clerk/client";
  import { clerkAppearance, ui } from "$lib/clerk-ui";
  import ConvexClerkSync from "$lib/components/convex-clerk-sync.svelte";
  import AuthModal from "$lib/components/auth-modal.svelte";

  interface Props {
    publishableKey: string;
    children: import("svelte").Snippet;
  }

  let { publishableKey, children }: Props = $props();
</script>

<ClerkProvider {publishableKey} {ui} appearance={clerkAppearance}>
  <ConvexClerkSync />
  {@render children()}
  <AuthModal />
</ClerkProvider>
