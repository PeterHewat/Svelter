import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  hasClerkReturnSignal,
  isClerkSessionHydrating,
  markClerkLoadRequested,
  mayHaveClerkSession,
  shouldEagerLoadClerk,
  wasClerkLoadRequested,
} from "./clerk-session-hint";

describe("mayHaveClerkSession", () => {
  const originalCookie = document.cookie;

  beforeEach(() => {
    document.cookie = "";
  });

  afterEach(() => {
    document.cookie = originalCookie;
  });

  it("returns false when no Clerk cookies are set", () => {
    expect(mayHaveClerkSession()).toBe(false);
  });

  it("returns false for Clerk signed-out sentinel __client_uat=0", () => {
    document.cookie = "__client_uat=0";
    expect(mayHaveClerkSession()).toBe(false);
  });

  it("returns true when __session is present", () => {
    document.cookie = "__session=eyJhbGciOiJIUzI1NiJ9.test";
    expect(mayHaveClerkSession()).toBe(true);
  });

  it("returns true when suffixed __session is present", () => {
    document.cookie = "__session_abc123=eyJhbGciOiJIUzI1NiJ9.test";
    expect(mayHaveClerkSession()).toBe(true);
  });

  it("returns true when __client_uat is greater than zero", () => {
    document.cookie = "__client_uat=1700000000";
    expect(mayHaveClerkSession()).toBe(true);
  });

  it("returns true when suffixed __client_uat is greater than zero", () => {
    document.cookie = "__client_uat_abc123=1700000000";
    expect(mayHaveClerkSession()).toBe(true);
  });
});

describe("isClerkSessionHydrating", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false when Clerk is loaded and signed out despite stale uat cookie", () => {
    document.cookie = "__client_uat=1700000000";
    expect(
      isClerkSessionHydrating({
        isLoaded: true,
        userId: null,
        hasSession: false,
      }),
    ).toBe(false);
  });

  it("returns true when OAuth return signal is present", () => {
    vi.stubGlobal("location", {
      search: "?__clerk_status=sign-in",
      hash: "",
    });
    expect(
      isClerkSessionHydrating({
        isLoaded: true,
        userId: null,
        hasSession: false,
      }),
    ).toBe(true);
  });

  it("returns true when session exists before userId is set", () => {
    expect(
      isClerkSessionHydrating({
        isLoaded: true,
        userId: null,
        hasSession: true,
      }),
    ).toBe(true);
  });
});

describe("clerk eager load signals", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
    document.cookie = "";
  });

  it("tracks clerk load requests in sessionStorage across reloads", () => {
    expect(wasClerkLoadRequested()).toBe(false);
    markClerkLoadRequested();
    expect(wasClerkLoadRequested()).toBe(true);
    expect(shouldEagerLoadClerk()).toBe(true);
  });

  it("detects Clerk OAuth return URLs", () => {
    vi.stubGlobal("location", {
      search: "?__clerk_status=sign-in",
      hash: "",
    });
    expect(hasClerkReturnSignal()).toBe(true);
    expect(shouldEagerLoadClerk()).toBe(true);
  });
});
