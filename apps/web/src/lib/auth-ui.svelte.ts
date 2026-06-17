/**
 * Global auth modal state (login / sign-up in a dialog).
 */
import { requestClerkLoad } from "$lib/clerk-load.svelte";

export type AuthModalAnchor = {
  /** Viewport offset from the top to the panel (below the trigger). */
  top: number;
  /** Viewport offset from the right to align with the trigger. */
  right: number;
};

export const authModal = $state({
  open: false,
  /** Path to navigate to after successful sign-in (e.g. `/tasks`). */
  redirectTo: null as string | null,
  /** Sign-in trigger position for anchoring the Clerk panel. */
  anchor: null as AuthModalAnchor | null,
});

/**
 * Track the sign-in trigger so the auth panel can anchor like UserButton.
 *
 * @param el - Header sign-in button, or null to clear
 */
export function setAuthModalAnchor(el: HTMLElement | null): void {
  if (!el) {
    authModal.anchor = null;
    return;
  }

  const rect = el.getBoundingClientRect();
  authModal.anchor = {
    top: rect.bottom,
    right: window.innerWidth - rect.right,
  };
}

/**
 * Open the auth modal.
 *
 * @param redirectTo - Optional post-login destination
 */
export function openAuthModal(redirectTo?: string): void {
  requestClerkLoad();
  authModal.open = true;
  authModal.redirectTo = redirectTo ?? null;
}

/** Close the auth modal and clear any pending redirect. */
export function closeAuthModal(): void {
  authModal.open = false;
  authModal.redirectTo = null;
  authModal.anchor = null;
}

/**
 * Close the modal and return the pending redirect path, if any.
 *
 * @returns Redirect path saved before close
 */
export function takeAuthRedirect(): string | null {
  const redirect = authModal.redirectTo;
  authModal.open = false;
  authModal.redirectTo = null;
  authModal.anchor = null;
  return redirect;
}
