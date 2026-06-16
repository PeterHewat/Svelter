<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    authModal,
    closeAuthModal,
    openAuthModal,
    takeAuthRedirect,
  } from "$lib/auth-ui.svelte";
  import { isAuthEnabled } from "$lib/backend";
  import { useTranslation } from "$lib/i18n";
  import { useAppAuth } from "$lib/use-app-auth.svelte";
  import { cn } from "@repo/utils";
  import { authPanelSignInAppearance } from "$lib/clerk-ui";
  import { SignIn } from "svelte-clerk/client";

  const { t } = useTranslation();
  const auth = useAppAuth();

  const signInFallback = $derived(
    authModal.redirectTo ?? page.url.pathname + page.url.search,
  );

  const panelStyle = $derived.by(() => {
    const anchor = authModal.anchor;
    const width = anchor
      ? `min(25rem, calc(100vw - ${anchor.right}px - 1rem))`
      : "min(25rem, calc(100vw - 2rem))";

    if (!anchor) {
      return `top: 4rem; right: 1rem; width: ${width};`;
    }

    return `top: ${anchor.top + 8}px; right: ${anchor.right}px; width: ${width};`;
  });

  $effect(() => {
    if (!isAuthEnabled()) return;
    if (page.url.searchParams.get("auth") !== "login") return;

    const redirect = page.url.searchParams.get("redirect");
    openAuthModal(redirect && redirect.startsWith("/") ? redirect : undefined);
  });

  $effect(() => {
    if (!authModal.open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  $effect(() => {
    if (!authModal.open || auth.isLoading || !auth.isAuthenticated) return;

    const redirect = takeAuthRedirect();
    if (redirect) void goto(redirect);
  });
</script>

{#if isAuthEnabled() && authModal.open}
  <button
    type="button"
    class="fixed inset-0 z-55 cursor-pointer bg-black/50"
    aria-label="Close dialog"
    onclick={closeAuthModal}
  ></button>
  <div
    role="dialog"
    aria-modal="true"
    aria-label={t("auth.tabsLabel")}
    class={cn(
      "auth-panel bg-background border-border fixed z-60 rounded-lg border p-2 shadow-lg",
    )}
    style={panelStyle}
  >
    <SignIn
      routing="hash"
      fallbackRedirectUrl={signInFallback}
      appearance={authPanelSignInAppearance}
    />
  </div>
{/if}
