<script lang="ts">
  import { cn } from "@repo/utils";
  import { iconButtonClass } from "@repo/utils/chrome";
  import { UserButton } from "svelte-clerk/client";
  import AuthAccountButton from "$lib/components/auth-account-button.svelte";
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

  const avatarReady = useClerkAvatarReady(
    () => userButtonRoot,
    () => mountUserButton,
  );

  const showSpinner = $derived(
    (auth.isLoading && !mayHaveClerkSession()) ||
      (mountUserButton && !avatarReady.ready),
  );
</script>

<AuthAccountButton
  loading={showSpinner}
  hideAnonymous={mountUserButton && avatarReady.ready}
  {ariaLabel}
  {onclick}
>
  {#snippet overlay()}
    {#if mountUserButton}
      <div
        bind:this={userButtonRoot}
        class={cn(
          iconButtonClass(),
          "auth-user-button-overlay absolute inset-0 overflow-hidden p-0 transition-opacity",
          avatarReady.ready
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <UserButton />
      </div>
    {/if}
  {/snippet}
</AuthAccountButton>

<style>
  :global(.auth-user-button-overlay .cl-rootBox),
  :global(.auth-user-button-overlay .cl-userButtonBox),
  :global(.auth-user-button-overlay .cl-userButtonTrigger),
  :global(.auth-user-button-overlay .cl-userButtonAvatarBox),
  :global(.auth-user-button-overlay .cl-avatarBox) {
    width: 100%;
    height: 100%;
  }

  :global(.auth-user-button-overlay .cl-userButtonTrigger),
  :global(.auth-user-button-overlay .cl-userButtonAvatarBox),
  :global(.auth-user-button-overlay .cl-avatarBox) {
    display: flex;
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
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    border-radius: 9999px;
  }
</style>
