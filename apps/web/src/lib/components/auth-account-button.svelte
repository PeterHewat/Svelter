<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "@repo/utils";
  import { iconButtonClass, iconSlotClass } from "@repo/utils/chrome";
  import AnonymousUserIcon from "$lib/components/anonymous-user-icon.svelte";
  import AuthIconSpinner from "$lib/components/auth-icon-spinner.svelte";

  interface Props {
    /** When true, shows a spinner ring and disables the anonymous button. */
    loading?: boolean;
    /** When true, keeps the anonymous button in layout but hides it visually. */
    hideAnonymous?: boolean;
    ariaLabel: string;
    title?: string;
    onclick: () => void;
    /** Optional layer rendered above the anonymous button (e.g. Clerk UserButton). */
    overlay?: Snippet;
  }

  let {
    loading = false,
    hideAnonymous = false,
    ariaLabel,
    title = ariaLabel,
    onclick,
    overlay,
  }: Props = $props();
</script>

<div class={iconSlotClass}>
  <div class="relative flex h-10 w-10 items-center justify-center">
    {#if loading}
      <AuthIconSpinner />
    {/if}

    <button
      type="button"
      class={cn(
        iconButtonClass(),
        hideAnonymous && "pointer-events-none invisible",
      )}
      {onclick}
      aria-haspopup="dialog"
      aria-label={ariaLabel}
      {title}
      aria-busy={loading || undefined}
      aria-hidden={hideAnonymous || undefined}
      tabindex={hideAnonymous ? -1 : undefined}
      disabled={loading || hideAnonymous}
    >
      <AnonymousUserIcon />
    </button>

    {@render overlay?.()}
  </div>
</div>
