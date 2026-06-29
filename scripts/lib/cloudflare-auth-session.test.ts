import { afterEach, describe, expect, test } from "bun:test";
import {
  clearSessionCloudflareApiToken,
  getSessionCloudflareApiToken,
  rememberCloudflareApiTokenForSession,
} from "./cloudflare-auth";

afterEach(() => {
  clearSessionCloudflareApiToken();
});

describe("session Cloudflare API token", () => {
  test("remembers and returns a pasted token", () => {
    rememberCloudflareApiTokenForSession("cf-token-abc");
    expect(getSessionCloudflareApiToken()).toEqual({
      token: "cf-token-abc",
      source: "prompt",
    });
  });

  test("clears the session token", () => {
    rememberCloudflareApiTokenForSession("cf-token-abc");
    clearSessionCloudflareApiToken();
    expect(getSessionCloudflareApiToken()).toBeNull();
  });
});
