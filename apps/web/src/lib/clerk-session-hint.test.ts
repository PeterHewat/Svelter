import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mayHaveClerkSession } from "./clerk-session-hint";

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

  it("returns true when __client_uat is greater than zero", () => {
    document.cookie = "__client_uat=1700000000";
    expect(mayHaveClerkSession()).toBe(true);
  });
});
