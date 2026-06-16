<script lang="ts">
  import Button from "./button.svelte";
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { ButtonSize, ButtonVariant } from "./index";

  type Props = HTMLButtonAttributes & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    pending?: boolean;
    pendingLabel?: string;
    children?: Snippet;
  };

  let {
    variant = "primary",
    size = "md",
    pending = false,
    pendingLabel = "Saving…",
    disabled,
    children,
    ...rest
  }: Props = $props();
</script>

<Button
  {variant}
  {size}
  type="submit"
  isLoading={pending}
  disabled={disabled || pending}
  {...rest}
>
  {#if pending}
    {pendingLabel}
  {:else if children}
    {@render children()}
  {/if}
</Button>
