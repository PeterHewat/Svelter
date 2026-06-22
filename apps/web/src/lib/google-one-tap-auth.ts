const ONE_TAP_TRIED_SESSION_KEY = "svelter:google-one-tap-tried";

/** How long to wait before assuming FedCM One Tap is showing (no DOM node). */
const ONE_TAP_PENDING_MS = 3_000;

/** DOM hints that Google Identity Services One Tap rendered (iframe path). */
const ONE_TAP_UI_SELECTORS = [
  'iframe[src*="accounts.google.com"]',
  "#credential_picker_container",
  '[id^="credential_picker"]',
] as const;

/** Console / error messages when One Tap cannot run (incognito, no Google session, …). */
const ONE_TAP_FAILURE_PATTERNS = [
  /fedcm get\(\) rejects/i,
  /accounts list is empty/i,
  /not signed in with the identity provider/i,
  /error retrieving a token/i,
] as const;

/** Props passed to Clerk `openGoogleOneTap` (subset we configure). */
type GoogleOneTapProps = {
  signInForceRedirectUrl?: string;
  signUpForceRedirectUrl?: string;
  cancelOnTapOutside?: boolean;
  itpSupport?: boolean;
  fedCmSupport?: boolean;
};

type ClerkOneTapHost = {
  openGoogleOneTap: (props?: GoogleOneTapProps) => void;
  openSignIn: (props?: { fallbackRedirectUrl?: string }) => void;
};

/**
 * @returns True when a Google One Tap iframe or picker container is in the document
 */
export function hasGoogleOneTapUi(root: ParentNode = document): boolean {
  for (const selector of ONE_TAP_UI_SELECTORS) {
    if (root.querySelector(selector)) {
      return true;
    }
  }
  return false;
}

/**
 * @returns True when One Tap was already opened this browser tab session
 */
export function hasTriedGoogleOneTapThisSession(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(ONE_TAP_TRIED_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/** Remember that One Tap was shown so the next sign-in click opens the Clerk modal. */
export function markGoogleOneTapTried(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(ONE_TAP_TRIED_SESSION_KEY, "1");
  } catch {
    // private browsing / disabled storage
  }
}

/** Clears the One Tap attempt flag (e.g. after sign-out). */
export function clearGoogleOneTapTried(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(ONE_TAP_TRIED_SESSION_KEY);
  } catch {
    // private browsing / disabled storage
  }
}

/**
 * @param message - Log or error text from GIS / FedCM
 * @returns True when the message indicates One Tap cannot run
 */
export function isGoogleOneTapFailureMessage(message: string): boolean {
  return ONE_TAP_FAILURE_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Watch GIS / FedCM logs and global errors; invoke `onFailure` when One Tap cannot run.
 *
 * @param onFailure - Called once when a failure pattern is observed
 * @param timeoutMs - Stop watching after this duration
 * @returns Cleanup function
 */
export function watchForGoogleOneTapFailure(
  onFailure: () => void,
  timeoutMs = ONE_TAP_PENDING_MS,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let settled = false;

  const maybeFail = (message: string) => {
    if (settled) return;
    if (isGoogleOneTapFailureMessage(message)) {
      settled = true;
      onFailure();
    }
  };

  const onWindowError = (event: ErrorEvent) => {
    maybeFail(event.message ?? "");
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    maybeFail(String(event.reason ?? ""));
  };

  /* eslint-disable no-console -- detect GIS/FedCM failure logs during the watch window */
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: unknown[]) => {
    originalError.apply(console, args);
    maybeFail(args.map(String).join(" "));
  };

  console.warn = (...args: unknown[]) => {
    originalWarn.apply(console, args);
    maybeFail(args.map(String).join(" "));
  };
  /* eslint-enable no-console */

  window.addEventListener("error", onWindowError);
  window.addEventListener("unhandledrejection", onRejection);

  const timer = window.setTimeout(() => {
    settled = true;
  }, timeoutMs);

  return () => {
    settled = true;
    /* eslint-disable no-console -- restore patched console methods */
    console.error = originalError;
    console.warn = originalWarn;
    /* eslint-enable no-console */
    window.removeEventListener("error", onWindowError);
    window.removeEventListener("unhandledrejection", onRejection);
    window.clearTimeout(timer);
  };
}

/**
 * Watch for the iframe-based One Tap UI.
 *
 * @param onShown - Called once when One Tap UI appears
 * @returns Cleanup function
 */
export function watchForGoogleOneTapUi(onShown: () => void): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }

  if (hasGoogleOneTapUi()) {
    onShown();
    return () => {};
  }

  let settled = false;
  const observer = new MutationObserver(() => {
    if (settled) return;
    if (hasGoogleOneTapUi()) {
      settled = true;
      observer.disconnect();
      onShown();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  return () => {
    settled = true;
    observer.disconnect();
  };
}

/**
 * Opens Clerk Google One Tap on demand. Does not close the prompt — FedCM renders
 * in the browser chrome and closing while active aborts the flow.
 *
 * @param clerk - Loaded Clerk instance
 * @param redirectUrl - Post sign-in path (same-origin)
 */
export function openGoogleOneTapPrompt(
  clerk: ClerkOneTapHost,
  redirectUrl: string,
): void {
  clerk.openGoogleOneTap({
    signInForceRedirectUrl: redirectUrl,
    signUpForceRedirectUrl: redirectUrl,
    cancelOnTapOutside: true,
    itpSupport: true,
    fedCmSupport: true,
  });
}

/**
 * First sign-in click: Google One Tap when available. When GIS / FedCM reports that
 * One Tap cannot run (incognito, no Google session), opens the Clerk modal on the
 * same click. FedCM success has no DOM node — a timeout only marks the attempt so
 * the second click opens Clerk without auto-opening it over a visible prompt.
 *
 * @param clerk - Loaded Clerk instance
 * @param redirectUrl - Post sign-in path (same-origin)
 */
export function openSignInWithGoogleOneTapFallback(
  clerk: ClerkOneTapHost,
  redirectUrl: string,
): void {
  if (hasTriedGoogleOneTapThisSession()) {
    clerk.openSignIn({ fallbackRedirectUrl: redirectUrl });
    return;
  }

  openGoogleOneTapPrompt(clerk, redirectUrl);

  let marked = false;
  const cleanups: Array<() => void> = [];

  const markTriedOnce = () => {
    if (marked) return;
    marked = true;
    markGoogleOneTapTried();
    for (const cleanup of cleanups) {
      cleanup();
    }
  };

  cleanups.push(
    watchForGoogleOneTapFailure(() => {
      markTriedOnce();
      clerk.openSignIn({ fallbackRedirectUrl: redirectUrl });
    }),
  );

  cleanups.push(
    watchForGoogleOneTapUi(() => {
      markTriedOnce();
    }),
  );

  const pendingTimer = window.setTimeout(() => {
    markTriedOnce();
  }, ONE_TAP_PENDING_MS);

  cleanups.push(() => {
    window.clearTimeout(pendingTimer);
  });
}
