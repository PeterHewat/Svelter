<script lang="ts">
  import { cn } from "@repo/utils";
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { ButtonSize, ButtonVariant } from "./index";

  type Props = Omit<HTMLButtonAttributes, "class"> & {
    class?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    children?: Snippet;
  };

  let {
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled,
    class: className,
    children,
    ...rest
  }: Props = $props();

  const baseClasses =
    "inline-flex cursor-pointer items-center justify-center rounded-md font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-muted text-muted-foreground hover:bg-muted/80",
    ghost: "bg-transparent hover:bg-muted",
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "h-8 px-2 text-sm",
    md: "h-10 px-3 text-base",
    lg: "h-12 px-4 text-lg",
  };

  const classes = $derived(
    cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      { "cursor-not-allowed opacity-60": disabled || isLoading },
      className,
    ),
  );
</script>

<button class={classes} disabled={disabled || isLoading} {...rest}>
  {#if children}
    {@render children()}
  {/if}
</button>
