import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  convexUrlFromDeploymentSlug,
  parseConvexDeployKeySlug,
  parseConvexProdDeploymentSlug,
  readConvexUrlFromRootEnv,
  resolveProdConvexUrl,
} from "./convex-url";

describe("parseConvexProdDeploymentSlug", () => {
  test("parses env set output", () => {
    expect(
      parseConvexProdDeploymentSlug(
        "✔ Successfully set CLERK_JWT_ISSUER_DOMAIN (on prod deployment laudable-deer-836)",
      ),
    ).toBe("laudable-deer-836");
  });

  test("parses deploy key output", () => {
    expect(
      parseConvexProdDeploymentSlug(
        '✔ Created deploy key "github-prod" for laudable-deer-836.',
      ),
    ).toBe("laudable-deer-836");
  });
});

describe("parseConvexDeployKeySlug", () => {
  test("parses prod deploy key prefix", () => {
    expect(
      parseConvexDeployKeySlug("prod:laudable-deer-836|eyJ2MiI6InRlc3QifQ=="),
    ).toBe("laudable-deer-836");
  });
});

describe("resolveProdConvexUrl", () => {
  test("derives URL from deploy key with regional reference", () => {
    expect(
      resolveProdConvexUrl(
        "prod:laudable-deer-836|token",
        undefined,
        "https://insightful-ibex-892.eu-west-1.convex.cloud",
      ),
    ).toBe("https://laudable-deer-836.eu-west-1.convex.cloud");
  });
});

describe("readConvexUrlFromRootEnv", () => {
  test("prefers VITE_CONVEX_URL over slug-derived host", () => {
    const root = mkdtempSync(join(tmpdir(), "svelter-convex-url-"));
    writeFileSync(
      join(root, ".env.local"),
      [
        "CONVEX_DEPLOYMENT=dev:insightful-ibex-892",
        "VITE_CONVEX_URL=https://insightful-ibex-892.eu-west-1.convex.cloud",
      ].join("\n"),
    );

    expect(readConvexUrlFromRootEnv(root)).toBe(
      "https://insightful-ibex-892.eu-west-1.convex.cloud",
    );
  });
});

describe("convexUrlFromDeploymentSlug", () => {
  test("preserves regional host suffix from reference URL", () => {
    expect(
      convexUrlFromDeploymentSlug(
        "laudable-deer-836",
        "https://descriptive-giraffe-224.eu-west-1.convex.cloud",
      ),
    ).toBe("https://laudable-deer-836.eu-west-1.convex.cloud");
  });

  test("falls back to default convex.cloud host", () => {
    expect(convexUrlFromDeploymentSlug("happy-animal-123")).toBe(
      "https://happy-animal-123.convex.cloud",
    );
  });
});
