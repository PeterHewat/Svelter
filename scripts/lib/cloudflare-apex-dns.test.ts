import { afterEach, describe, expect, test } from "bun:test";
import {
  resolvePagesSubdomain,
  resetApexDnsSyncSession,
} from "./cloudflare-apex-dns";

afterEach(() => {
  resetApexDnsSyncSession();
});

describe("resolvePagesSubdomain", () => {
  test("uses API subdomain when present", () => {
    expect(
      resolvePagesSubdomain("my-app-web", "my-app-web-abc.pages.dev"),
    ).toBe("my-app-web-abc.pages.dev");
  });

  test("falls back to project name", () => {
    expect(resolvePagesSubdomain("extractora-web")).toBe(
      "extractora-web.pages.dev",
    );
  });
});
