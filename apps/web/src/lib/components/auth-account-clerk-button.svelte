<script lang="ts">
  import { cn } from "@repo/utils";
  import { UserButton } from "svelte-clerk/client";
  import AuthAccountButton from "$lib/components/auth-account-button.svelte";
  import {
    readCachedAvatarUrl,
    writeCachedAvatarUrl,
  } from "$lib/clerk-avatar-cache";
  import { useClerkAvatarReady } from "$lib/clerk-avatar-ready.svelte";
  import { mayHaveClerkSession } from "$lib/clerk-session-hint";
  import { useAppAuth } from "$lib/use-app-auth.svelte";

  interface Props {
    ariaLabel: string;
    onclick: () => void;
  }

  let { ariaLabel, onclick }: Props = $props();

  const auth = useAppAuth();

  let userButtonRoot = $state<HTMLDivElement | null>(null);

  const mountUserButton = $derived(
    auth.isAuthenticated || (auth.isLoading && mayHaveClerkSession()),
  );

  const cachedAvatarUrl = $derived(
    mountUserButton ? readCachedAvatarUrl() : null,
  );

  const avatarReady = useClerkAvatarReady(
    () => userButtonRoot,
    () => mountUserButton,
  );

  const showSpinner = $derived(
    (auth.isLoading && !mayHaveClerkSession()) ||
      (mountUserButton && !avatarReady.ready && !cachedAvatarUrl),
  );

  const showCachedAvatar = $derived(
    mountUserButton && !avatarReady.ready && !!cachedAvatarUrl,
  );

  $effect(() => {
    if (!avatarReady.ready || !userButtonRoot) return;
    const img = userButtonRoot.querySelector("img");
    const src = img?.getAttribute("src");
    if (src?.startsWith("http")) {
      writeCachedAvatarUrl(src);
    }
  });
</script>

<AuthAccountButton
  loading={showSpinner}
  hideAnonymous={mountUserButton && (avatarReady.ready || showCachedAvatar)}
  {ariaLabel}
  {onclick}
>
  {#snippet overlay()}
    {#if showCachedAvatar && cachedAvatarUrl}
      <img
        src={cachedAvatarUrl}
        alt=""
        class="auth-account-avatar-image pointer-events-none absolute z-10"
        aria-hidden="true"
      />
    {/if}
    {#if mountUserButton}
      <div
        bind:this={userButtonRoot}
        class={cn(
          "auth-user-button-overlay absolute inset-0 z-20 flex items-center justify-center",
          avatarReady.ready
            ? "visible pointer-events-auto"
            : "invisible pointer-events-none",
        )}
      >
        <UserButton />
      </div>
    {/if}
  {/snippet}
</AuthAccountButton>

<style>
  :global(.auth-user-button-overlay .cl-rootBox),
  :global(.auth-user-button-overlay .cl-userButtonBox) {
    width: 38px;
    height: 38px;
  }

  :global(.auth-user-button-overlay .cl-userButtonTrigger),
  :global(.auth-user-button-overlay .cl-userButtonAvatarBox),
  :global(.auth-user-button-overlay .cl-avatarBox) {
    display: flex;
    width: 38px;
    height: 38px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 9999px;
  }

  :global(.auth-user-button-overlay .cl-userButtonTrigger) {
    border: none;
    background: transparent;
    box-shadow: none;
    padding: 0;
  }

  :global(.auth-user-button-overlay img) {
    display: block;
    width: 38px;
    height: 38px;
    max-width: 38px;
    max-height: 38px;
    object-fit: cover;
    object-position: center;
    border-radius: 9999px;
  }
</style>
