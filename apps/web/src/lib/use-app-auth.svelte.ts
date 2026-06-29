import { useClerkContext } from "svelte-clerk/client";
import { clearCachedAvatarUrl } from "$lib/clerk-avatar-cache";
import { clearGoogleOneTapTried } from "$lib/google-one-tap-auth";
import { isAuthEnabled } from "$lib/backend";

const disabledAuth = {
  isLoading: false,
  isAuthenticated: false,
  signOut: async () => {},
};

/**
 * App-facing Clerk auth hook with loading state for UI gates.
 */
export function useAppAuth() {
  if (!isAuthEnabled()) {
    return disabledAuth;
  }

  const clerk = useClerkContext();

  const isLoading = $derived(!clerk.isLoaded);
  const isAuthenticated = $derived(Boolean(clerk.auth.userId));

  return {
    get isLoading() {
      return isLoading;
    },
    get isAuthenticated() {
      return isAuthenticated;
    },
    signOut: async () => {
      clearGoogleOneTapTried();
      clearCachedAvatarUrl();
      await clerk.clerk?.signOut();
    },
  };
}
