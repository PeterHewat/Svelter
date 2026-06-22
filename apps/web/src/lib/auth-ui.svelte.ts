/**
 * Global auth modal state (login / sign-up in a dialog).
 */
import { requestClerkLoad } from "$lib/clerk-load.svelte";

export type OpenAuthModalOptions = {
  /** Skip Google One Tap and open the Clerk sign-in modal (explicit login intent). */
  skipOneTap?: boolean;
};

export const authModal = $state({
  /** Queued until Clerk is loaded and can open its native sign-in modal. */
  pending: false,
  /** Path to navigate to after successful sign-in (e.g. `/tasks`). */
  redirectTo: null as string | null,
  /** When true, open Clerk sign-in directly instead of Google One Tap first. */
  skipOneTap: false,
});

/**
 * Open the auth modal.
 *
 * @param redirectTo - Optional post-login destination
 * @param options - Flow options (e.g. skip One Tap for `/login` deep links)
 */
export function openAuthModal(
  redirectTo?: string,
  options?: OpenAuthModalOptions,
): void {
  requestClerkLoad();
  authModal.pending = true;
  authModal.redirectTo = redirectTo ?? null;
  authModal.skipOneTap = options?.skipOneTap ?? false;
}

/** Clear a queued sign-in request after Clerk opens its modal. */
export function clearAuthModalPending(): void {
  authModal.pending = false;
  authModal.redirectTo = null;
  authModal.skipOneTap = false;
}
