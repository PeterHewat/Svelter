<script lang="ts">
  import { page } from "$app/state";
  import { SiteFooter } from "@repo/ui-svelte";
  import { siteMainContainerClass } from "@repo/utils/chrome";
  import { onMount } from "svelte";
  import AppHeader from "$lib/components/app-header.svelte";
  import {
    clerkLoad,
    getAuthShell,
    initClerkLoad,
    requestClerkLoad,
  } from "$lib/clerk-load.svelte";
  import { needsClerkForRoute } from "$lib/clerk-routes";
  import { useTranslation } from "$lib/i18n";

  interface Props {
    publishableKey: string;
    copyright: string;
    children: import("svelte").Snippet;
  }

  let { publishableKey, copyright, children }: Props = $props();

  const { t } = useTranslation();

  const routeNeedsClerk = $derived(
    needsClerkForRoute(page.url.pathname, page.url.searchParams),
  );

  const headerMode = $derived.by(() => {
    if (clerkLoad.status === "ready") return "ready" as const;
    if (clerkLoad.requested || routeNeedsClerk) return "loading" as const;
    return "anonymous" as const;
  });

  const showRouteLoading = $derived(
    routeNeedsClerk && clerkLoad.status !== "ready",
  );

  const showAnonymousMain = $derived(
    !routeNeedsClerk && clerkLoad.status !== "ready",
  );

  const AuthShell = $derived(getAuthShell());

  onMount(() => {
    initClerkLoad();
  });

  $effect(() => {
    if (routeNeedsClerk) {
      requestClerkLoad();
    }
  });

  $effect(() => {
    if (clerkLoad.status === "ready") return;
    if (!clerkLoad.requested && clerkLoad.status === "idle") return;
    void import("$lib/load-auth-shell.ts").then((module) =>
      module.loadAuthShell(),
    );
  });
</script>

{#if clerkLoad.status === "ready" && AuthShell}
  <AuthShell {publishableKey}>
    <div class="flex min-h-screen flex-col">
      <AppHeader mode="ready" />
      <main class={siteMainContainerClass}>
        {@render children()}
      </main>
      <SiteFooter {copyright} />
    </div>
  </AuthShell>
{:else}
  <div class="flex min-h-screen flex-col">
    <AppHeader mode={headerMode} />
    <main class={siteMainContainerClass}>
      {#if showRouteLoading}
        <p class="text-muted-foreground mt-24 text-center" role="status">
          {t("common.loading")}
        </p>
      {:else if showAnonymousMain}
        {@render children()}
      {/if}
    </main>
    <SiteFooter {copyright} />
  </div>
{/if}
