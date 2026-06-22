<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    authModal,
    clearAuthModalPending,
    openAuthModal,
  } from "$lib/auth-ui.svelte";
  import { isAuthEnabled } from "$lib/backend";
  import {
    hasAuthLoginParam,
    stripAuthLoginFromSearchParams,
    urlWithoutAuthLoginParam,
  } from "$lib/clerk-routes";
  import {
    clearGoogleOneTapTried,
    openSignInWithGoogleOneTapFallback,
  } from "$lib/google-one-tap-auth";
  import { useClerkContext } from "svelte-clerk/client";

  const clerk = useClerkContext();

  function resolveRedirectPath(redirectTo: string | null): string {
    const base = redirectTo?.startsWith("/")
      ? redirectTo
      : page.url.pathname + page.url.search + page.url.hash;
    const url = new URL(base, page.url.origin);
    stripAuthLoginFromSearchParams(url.searchParams);
    const search = url.searchParams.toString();
    return `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
  }

  $effect(() => {
    if (!isAuthEnabled()) return;
    if (!hasAuthLoginParam(page.url.searchParams)) return;

    const redirect = page.url.searchParams.get("redirect");
    const redirectTo =
      redirect && redirect.startsWith("/") ? redirect : undefined;
    const cleaned = urlWithoutAuthLoginParam(page.url);
    if (cleaned) {
      void goto(cleaned, {
        replaceState: true,
        keepFocus: true,
        noScroll: true,
      });
    }

    if (clerk.isLoaded && clerk.auth.userId) {
      return;
    }

    openAuthModal(redirectTo, { skipOneTap: true });
  });

  $effect(() => {
    if (clerk.auth.userId) {
      clearGoogleOneTapTried();
    }
  });

  $effect(() => {
    if (!authModal.pending || !clerk.isLoaded || !clerk.clerk) return;

    const redirectTo = resolveRedirectPath(authModal.redirectTo);
    const skipOneTap = authModal.skipOneTap;
    clearAuthModalPending();

    if (clerk.auth.userId) {
      void goto(redirectTo, {
        replaceState: true,
        keepFocus: true,
        noScroll: true,
      });
      return;
    }

    if (skipOneTap) {
      clerk.clerk.openSignIn({ fallbackRedirectUrl: redirectTo });
      return;
    }

    void openSignInWithGoogleOneTapFallback(clerk.clerk, redirectTo);
  });
</script>
