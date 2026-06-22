<script lang="ts">
  import { cn } from "@repo/utils";
  import {
    languageSwitcherDetailsClass,
    languageSwitcherIconOnlyClass,
    languageSwitcherIconOnlySummaryClass,
    languageSwitcherMenuCheckSlotClass,
    languageSwitcherMenuClass,
    languageSwitcherMenuItemClass,
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
  let detailsEl = $state<HTMLDetailsElement | undefined>();

  onMount(() => {
    locale = store.getState().locale;
    const unsubscribe = store.subscribe((state) => {
      locale = state.locale;
    });

    function handleDocumentClick(event: MouseEvent) {
      if (!detailsEl?.open) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element) || !detailsEl.contains(target)) {
        detailsEl.open = false;
      }
    }

    function handleDocumentKeydown(event: KeyboardEvent) {
      if (event.key === "Escape" && detailsEl?.open) {
        detailsEl.open = false;
      }
    }

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeydown);

    return () => {
      unsubscribe();
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleDocumentKeydown);
    };
  });

  function selectLocale(value: Locale) {
    store.getState().setLocale(value);
    if (detailsEl) {
      detailsEl.open = false;
    }
  }
</script>

<details
  bind:this={detailsEl}
  class={cn(
    languageSwitcherDetailsClass,
    languageSwitcherIconOnlyClass,
    wrapperSizeClasses[size],
    className,
  )}
>
  <summary
    class={languageSwitcherIconOnlySummaryClass}
    aria-label={ariaLabel}
    title={ariaLabel}
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
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  </summary>
  <ul class={languageSwitcherMenuClass} role="list">
    {#each Object.keys(SUPPORTED_LOCALES) as loc (loc)}
      <li>
        <button
          type="button"
          class={languageSwitcherMenuItemClass}
          onclick={() => selectLocale(loc as Locale)}
          aria-current={loc === locale ? "true" : undefined}
        >
          <span class={languageSwitcherMenuCheckSlotClass} aria-hidden="true">
            {#if loc === locale}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            {/if}
          </span>
          {SUPPORTED_LOCALES[loc as Locale]}
        </button>
      </li>
    {/each}
  </ul>
</details>
