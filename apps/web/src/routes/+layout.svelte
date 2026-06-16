<script lang="ts">
  import "../app.css";
  import { setupConvex } from "convex-svelte";
  import { ClerkProvider } from "svelte-clerk/client";
  import { clerkAppearance, ui } from "$lib/clerk-ui";
  import { initializeTheme } from "@repo/utils/theme";
  import { onMount } from "svelte";
  import { isAuthEnabled, isBackendEnabled } from "$lib/backend";
  import { loadWebEnv } from "$lib/web-env";
  import AppHeader from "$lib/components/app-header.svelte";
  import ConvexClerkSync from "$lib/components/convex-clerk-sync.svelte";
  import AuthModal from "$lib/components/auth-modal.svelte";
  import "$lib/i18n";

  let { children } = $props();

  const env = loadWebEnv();

  if (isBackendEnabled() && env.convexUrl) {
    setupConvex(env.convexUrl);
  }

  onMount(() => {
    initializeTheme();
    requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-transition");
    });
  });
</script>

<svelte:head>
  <title>Svelter</title>
</svelte:head>

{#if isAuthEnabled() && env.clerkPublishableKey}
  <ClerkProvider
    publishableKey={env.clerkPublishableKey}
    {ui}
    appearance={clerkAppearance}
  >
    <ConvexClerkSync />
    <div class="flex min-h-screen flex-col">
      <AppHeader />
      <main class="container mx-auto flex-1 px-4 py-8 pt-20">
        {@render children()}
      </main>
      <AuthModal />
    </div>
  </ClerkProvider>
{:else}
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="container mx-auto flex-1 px-4 py-8 pt-20">
      {@render children()}
    </main>
  </div>
{/if}
