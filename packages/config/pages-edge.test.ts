import { describe, expect, test } from "vitest";
import {
  IMMUTABLE_ASSET_CACHE_CONTROL,
  MARKETING_INIT_CACHE_CONTROL,
  marketingPagesHeadersFile,
  webPagesHeadersFile,
} from "./pages-edge";

describe("webPagesHeadersFile", () => {
  test("sets long-lived cache for hashed immutable assets", () => {
    const headers = webPagesHeadersFile();
    expect(headers).toContain("/_app/immutable/*");
    expect(headers).toContain(IMMUTABLE_ASSET_CACHE_CONTROL);
    expect(headers).toContain("Content-Security-Policy:");
  });
});

describe("marketingPagesHeadersFile", () => {
  test("sets immutable cache for hashed assets and short cache for init.js", () => {
    const headers = marketingPagesHeadersFile();
    expect(headers).toContain("/_app/immutable/*");
    expect(headers).toContain(IMMUTABLE_ASSET_CACHE_CONTROL);
    expect(headers).toContain("/init.js");
    expect(headers).toContain(MARKETING_INIT_CACHE_CONTROL);
    expect(headers).not.toContain("Content-Security-Policy:");
  });
});
