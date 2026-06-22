<script lang="ts">
  import { ClerkProvider } from "svelte-clerk/client";
  import { clerkAppearance, ui } from "$lib/clerk-ui";
  import ConvexClerkSync from "$lib/components/convex-clerk-sync.svelte";
  import AuthModal from "$lib/components/auth-modal.svelte";
  import { initConvexFromEnv } from "$lib/init-convex-from-env";

  initConvexFromEnv();

  interface Props {
    publishableKey: string;
    children: import("svelte").Snippet;
  }

  let { publishableKey, children }: Props = $props();
</script>

<ClerkProvider {publishableKey} {ui} appearance={clerkAppearance}>
  <ConvexClerkSync />
  <!-- Clerk Smart CAPTCHA mount (One Tap / sign-up bot protection). -->
  <div id="clerk-captcha" class="sr-only" aria-hidden="true"></div>
  {@render children()}
  <AuthModal />
</ClerkProvider>
