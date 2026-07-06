<script lang="ts">
  import { cn } from "@repo/utils";
  import { iconButtonClass } from "@repo/utils/chrome";
  import {
    themeToggleAriaLabel,
    themeToggleTitle,
    useThemeStore,
    type ResolvedTheme,
  } from "@repo/utils/theme";
  import { chromeIconSizeClasses } from "../icon-chrome";
  import MoonIcon from "./moon-icon.svelte";
  import SunIcon from "./sun-icon.svelte";

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
  let resolvedTheme = $state<ResolvedTheme>(store.getState().resolvedTheme);

  $effect(() => {
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

  const iconSizeClasses = chromeIconSizeClasses;

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
  {#if nextMode === "light"}
    <SunIcon class={iconSizeClasses[size]} />
  {:else}
    <MoonIcon class={iconSizeClasses[size]} />
  {/if}
</button>
