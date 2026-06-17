<script lang="ts">
  import { cn } from "@repo/utils";
  import {
    languageSwitcherBaseClass,
    languageSwitcherSelectClass,
    languageSwitcherSizes,
  } from "@repo/utils/chrome";
  import {
    SUPPORTED_LOCALES,
    useI18nStore,
    type Locale,
  } from "@repo/utils/i18n";
  import { onMount } from "svelte";

  interface Props {
    class?: string;
    size?: "sm" | "md" | "lg";
    /** Accessible name for the select (pass a translated label from the app). */
    ariaLabel?: string;
  }

  let {
    class: className,
    size = "md",
    ariaLabel = "Select language",
  }: Props = $props();

  const wrapperSizeClasses = languageSwitcherSizes;

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const store = useI18nStore;
  let locale = $state(store.getState().locale);

  onMount(() => {
    locale = store.getState().locale;
    return store.subscribe((state) => {
      locale = state.locale;
    });
  });

  function handleChange(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value as Locale;
    store.getState().setLocale(value);
  }
</script>

<div class={cn(languageSwitcherBaseClass, wrapperSizeClasses[size], className)}>
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
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
  <select
    id="language-switcher"
    name="locale"
    value={locale}
    onchange={handleChange}
    class={languageSwitcherSelectClass}
    aria-label={ariaLabel}
  >
    {#each Object.keys(SUPPORTED_LOCALES) as loc (loc)}
      <option value={loc}>{SUPPORTED_LOCALES[loc as Locale]}</option>
    {/each}
  </select>
</div>
