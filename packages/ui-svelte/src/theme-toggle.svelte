<script lang="ts">
  import { cn } from "@repo/utils";
  import { iconButtonClass } from "@repo/utils/chrome";
  import {
    themeToggleAriaLabel,
    themeToggleTitle,
    useThemeStore,
    type ResolvedTheme,
  } from "@repo/utils/theme";
  import { onMount } from "svelte";

  interface Props {
    class?: string;
    size?: "sm" | "md" | "lg";
    labels?: {
      light?: string;
      dark?: string;
      switchToLight?: string;
      switchToDark?: string;
      switchToLightAria?: string;
      switchToDarkAria?: string;
    };
  }

  let { class: className, size = "md", labels = {} }: Props = $props();

  const defaultLabels = { light: "Light", dark: "Dark" };
  const mergedLabels = $derived({ ...defaultLabels, ...labels });

  const store = useThemeStore;
  let resolvedTheme = $state<ResolvedTheme>("light");

  onMount(() => {
    resolvedTheme = store.getState().resolvedTheme;
    return store.subscribe((state) => {
      resolvedTheme = state.resolvedTheme;
    });
  });

  const nextMode = $derived<ResolvedTheme>(
    resolvedTheme === "light" ? "dark" : "light",
  );
  const targetLabel = $derived(
    nextMode === "light"
      ? (labels.switchToLight ?? themeToggleTitle("light", mergedLabels))
      : (labels.switchToDark ?? themeToggleTitle("dark", mergedLabels)),
  );
  const targetAriaLabel = $derived(
    nextMode === "light"
      ? (labels.switchToLightAria ??
          themeToggleAriaLabel("light", mergedLabels))
      : (labels.switchToDarkAria ?? themeToggleAriaLabel("dark", mergedLabels)),
  );

  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  function toggle() {
    store.getState().setMode(nextMode);
  }
</script>

<button
  type="button"
  class={cn(iconButtonClass(), sizeClasses[size], className)}
  onclick={toggle}
  aria-label={targetAriaLabel}
  title={targetLabel}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={cn("text-muted-foreground shrink-0", iconSizeClasses[size])}
    aria-hidden="true"
  >
    {#if nextMode === "light"}
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
      />
    {:else}
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    {/if}
  </svg>
</button>
