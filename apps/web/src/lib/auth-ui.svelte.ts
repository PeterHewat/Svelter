/**
 * Global auth modal state (login / sign-up in a dialog).
 */
import { requestClerkLoad } from "$lib/clerk-load.svelte";

export const authModal = $state({
  /** Queued until Clerk is loaded and can open its native sign-in modal. */
  pending: false,
  /** Path to navigate to after successful sign-in (e.g. `/tasks`). */
  redirectTo: null as string | null,
});

/**
 * Open the auth modal.
 *
 * @param redirectTo - Optional post-login destination
 */
export function openAuthModal(redirectTo?: string): void {
  requestClerkLoad();
  authModal.pending = true;
  authModal.redirectTo = redirectTo ?? null;
}

/** Clear a queued sign-in request after Clerk opens its modal. */
export function clearAuthModalPending(): void {
  authModal.pending = false;
  authModal.redirectTo = null;
}
