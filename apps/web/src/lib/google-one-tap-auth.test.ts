import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearGoogleOneTapTried,
  hasGoogleOneTapUi,
  hasTriedGoogleOneTapThisSession,
  isGoogleOneTapFailureMessage,
  markGoogleOneTapTried,
  openSignInWithGoogleOneTapFallback,
  watchForGoogleOneTapFailure,
} from "./google-one-tap-auth";

describe("hasGoogleOneTapUi", () => {
  it("returns false when no One Tap elements exist", () => {
    const root = document.createElement("div");
    expect(hasGoogleOneTapUi(root)).toBe(false);
  });

  it("detects Google accounts iframe", () => {
    const root = document.createElement("div");
    const iframe = document.createElement("iframe");
    iframe.src = "https://accounts.google.com/gsi/button";
    root.append(iframe);
    expect(hasGoogleOneTapUi(root)).toBe(true);
  });

  it("detects credential picker container", () => {
    const root = document.createElement("div");
    const picker = document.createElement("div");
    picker.id = "credential_picker_container";
    root.append(picker);
    expect(hasGoogleOneTapUi(root)).toBe(true);
  });
});

describe("google one tap session flag", () => {
  afterEach(() => {
    clearGoogleOneTapTried();
  });

  it("tracks whether One Tap was tried this session", () => {
    expect(hasTriedGoogleOneTapThisSession()).toBe(false);
    markGoogleOneTapTried();
    expect(hasTriedGoogleOneTapThisSession()).toBe(true);
    clearGoogleOneTapTried();
    expect(hasTriedGoogleOneTapThisSession()).toBe(false);
  });
});

describe("isGoogleOneTapFailureMessage", () => {
  it("matches FedCM and empty-account GIS errors", () => {
    expect(
      isGoogleOneTapFailureMessage(
        "[GSI_LOGGER]: FedCM get() rejects with NetworkError: Error retrieving a token.",
      ),
    ).toBe(true);
    expect(
      isGoogleOneTapFailureMessage("Provider's accounts list is empty."),
    ).toBe(true);
    expect(
      isGoogleOneTapFailureMessage("Not signed in with the identity provider."),
    ).toBe(true);
  });

  it("ignores unrelated messages", () => {
    expect(isGoogleOneTapFailureMessage("Something else failed")).toBe(false);
  });
});

describe("watchForGoogleOneTapFailure", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("invokes onFailure when GIS logs a FedCM error", () => {
    vi.useFakeTimers();
    const onFailure = vi.fn();
    const cleanup = watchForGoogleOneTapFailure(onFailure, 3_000);

    /* eslint-disable-next-line no-console -- exercise GIS failure log hook */
    console.error(
      "[GSI_LOGGER]: FedCM get() rejects with NetworkError: Error retrieving a token.",
    );

    expect(onFailure).toHaveBeenCalledOnce();
    cleanup();
  });
});

describe("openSignInWithGoogleOneTapFallback", () => {
  afterEach(() => {
    clearGoogleOneTapTried();
    vi.useRealTimers();
  });

  it("opens Clerk sign-in on the second click", () => {
    const clerk = {
      openGoogleOneTap: vi.fn(),
      openSignIn: vi.fn(),
    };
    markGoogleOneTapTried();

    openSignInWithGoogleOneTapFallback(clerk, "/tasks");

    expect(clerk.openGoogleOneTap).not.toHaveBeenCalled();
    expect(clerk.openSignIn).toHaveBeenCalledWith({
      fallbackRedirectUrl: "/tasks",
    });
  });

  it("falls back to Clerk on the same click when GIS reports failure", () => {
    const clerk = {
      openGoogleOneTap: vi.fn(),
      openSignIn: vi.fn(),
    };

    openSignInWithGoogleOneTapFallback(clerk, "/tasks");
    /* eslint-disable-next-line no-console -- exercise GIS failure log hook */
    console.error("Provider's accounts list is empty.");

    expect(clerk.openGoogleOneTap).toHaveBeenCalledOnce();
    expect(clerk.openSignIn).toHaveBeenCalledWith({
      fallbackRedirectUrl: "/tasks",
    });
    expect(hasTriedGoogleOneTapThisSession()).toBe(true);
  });

  it("opens One Tap only when GIS does not report failure", () => {
    vi.useFakeTimers();
    const clerk = {
      openGoogleOneTap: vi.fn(),
      openSignIn: vi.fn(),
    };

    openSignInWithGoogleOneTapFallback(clerk, "/tasks");
    vi.advanceTimersByTime(3_000);

    expect(clerk.openGoogleOneTap).toHaveBeenCalledOnce();
    expect(clerk.openSignIn).not.toHaveBeenCalled();
    expect(hasTriedGoogleOneTapThisSession()).toBe(true);
  });
});
