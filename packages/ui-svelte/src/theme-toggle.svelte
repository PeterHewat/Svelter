<script lang="ts">
  import { cn } from "@repo/utils";
  import { useThemeStore, type ResolvedTheme } from "@repo/utils/theme";
  import { onMount } from "svelte";

  interface Props {
    class?: string;
    size?: "sm" | "md" | "lg";
    labels?: { light?: string; dark?: string };
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
  const targetLabel = $derived(mergedLabels[nextMode]);

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

  const focusRing =
    "focus-visible:ring-ring focus:outline-none focus-visible:ring-2";

  function toggle() {
    store.getState().setMode(nextMode);
  }
</script>

<button
  type="button"
  class={cn(
    "border-border bg-background text-foreground inline-flex cursor-pointer items-center justify-center rounded-md border",
    "hover:bg-secondary hover:text-secondary-foreground",
    focusRing,
    sizeClasses[size],
    className,
  )}
  onclick={toggle}
  aria-label="Switch to {targetLabel} theme."
  title="Switch to {targetLabel}"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={cn("shrink-0", iconSizeClasses[size])}
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
