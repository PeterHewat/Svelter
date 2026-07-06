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
  import { chromeIconSizeClasses } from "../icon-chrome";
  import CheckIcon from "./check-icon.svelte";
  import I18nIcon from "./i18n-icon.svelte";

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

  const iconSizeClasses = chromeIconSizeClasses;

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
    <I18nIcon class={iconSizeClasses[size]} />
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
              <CheckIcon />
            {/if}
          </span>
          {SUPPORTED_LOCALES[loc as Locale]}
        </button>
      </li>
    {/each}
  </ul>
</details>
