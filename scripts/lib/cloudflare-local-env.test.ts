import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  CLOUDFLARE_LOCAL_ENV,
  clearSessionCloudflareApiToken,
  persistCloudflareApiToken,
  readPersistedCloudflareApiToken,
  storeCloudflareApiToken,
} from "./cloudflare-auth";

const validToken = "a".repeat(40);

describe("persisted Cloudflare API token", () => {
  let root: string;

  afterEach(() => {
    clearSessionCloudflareApiToken();
    rmSync(root, { recursive: true, force: true });
  });

  test("persists and reads a token from .svelter/cloudflare.env", () => {
    root = mkdtempSync(join(tmpdir(), "cloudflare-local-env-"));
    persistCloudflareApiToken(root, validToken);

    expect(readPersistedCloudflareApiToken(root)).toEqual({
      token: validToken,
      source: "local",
    });
    expect(readFileSync(join(root, CLOUDFLARE_LOCAL_ENV), "utf8")).toContain(
      `CLOUDFLARE_API_TOKEN=${validToken}`,
    );
  });

  test("storeCloudflareApiToken persists and remembers for the session", () => {
    root = mkdtempSync(join(tmpdir(), "cloudflare-local-env-"));
    storeCloudflareApiToken(root, validToken);

    expect(readPersistedCloudflareApiToken(root)?.token).toBe(validToken);
  });
});
