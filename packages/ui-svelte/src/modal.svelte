<script lang="ts">
  import { cn } from "@repo/utils";
  import type { Snippet } from "svelte";

  interface Props {
    open?: boolean;
    /** Accessible name when no visible title is rendered. */
    ariaLabel?: string;
    /** Id of an element inside children that labels the dialog. */
    labelledBy?: string;
    title?: string;
    class?: string;
    onClose?: () => void;
    children?: Snippet;
  }

  let {
    open = false,
    ariaLabel = "Dialog",
    labelledBy,
    title,
    class: className,
    onClose,
    children,
  }: Props = $props();

  const titleId = "modal-title";

  $effect(() => {
    if (!open || !onClose) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button
      type="button"
      class="absolute inset-0 bg-black/50"
      aria-label="Close dialog"
      onclick={() => onClose?.()}
    ></button>
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : labelledBy}
      aria-label={title || labelledBy ? undefined : ariaLabel}
      class={cn(
        "bg-background border-border relative z-10 w-full max-w-sm rounded-lg border p-6 shadow-lg",
        className,
      )}
    >
      {#if title}
        <h2 id={titleId} class="mb-6 text-2xl font-bold">{title}</h2>
      {/if}
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>
{/if}
