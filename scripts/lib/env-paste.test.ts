import { describe, expect, it } from "bun:test";
import { normalizeEnvPaste } from "./env-paste";

describe("normalizeEnvPaste", () => {
  it("strips a matching KEY= prefix (case-insensitive)", () => {
    expect(
      normalizeEnvPaste(
        "PUBLIC_CONVEX_URL",
        "PUBLIC_CONVEX_URL=https://foo.convex.cloud",
      ),
    ).toBe("https://foo.convex.cloud");
    expect(
      normalizeEnvPaste(
        "PUBLIC_CONVEX_URL",
        "public_convex_url=https://bar.convex.cloud",
      ),
    ).toBe("https://bar.convex.cloud");
  });

  it("returns the value unchanged when no prefix is present", () => {
    expect(
      normalizeEnvPaste("PUBLIC_CONVEX_URL", "https://foo.convex.cloud"),
    ).toBe("https://foo.convex.cloud");
  });
});
