import { useClerkContext } from "svelte-clerk/client";
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
      await clerk.clerk?.signOut();
    },
  };
}
