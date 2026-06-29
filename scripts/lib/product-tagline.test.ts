import { afterEach, describe, expect, it } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { readProductTagline, writeProductTagline } from "./product-tagline";

const MULTILINE_PRODUCT_TS = `export const PRODUCT_NAME = "Svelter";

/** Default marketing site tagline suffix (home page title). */
export const PRODUCT_TAGLINE =
  "A production-ready monorepo template for product and marketing websites.";

export const PRODUCT_SIGNUP_PATH = "/sign-up";
`;

describe("readProductTagline", () => {
  let root = "";

  afterEach(() => {
    if (root) {
      rmSync(root, { recursive: true, force: true });
      root = "";
    }
  });

  it("reads a multiline PRODUCT_TAGLINE assignment", () => {
    root = mkdtempSync(join(tmpdir(), "product-tagline-"));
    const productPath = join(root, "packages/config/product.ts");
    mkdirSync(dirname(productPath), { recursive: true });
    writeFileSync(productPath, MULTILINE_PRODUCT_TS, "utf8");
    expect(readProductTagline(root)).toBe(
      "A production-ready monorepo template for product and marketing websites.",
    );
  });
});

describe("writeProductTagline", () => {
  let root = "";

  afterEach(() => {
    if (root) {
      rmSync(root, { recursive: true, force: true });
      root = "";
    }
  });

  it("replaces a multiline PRODUCT_TAGLINE assignment", () => {
    root = mkdtempSync(join(tmpdir(), "product-tagline-"));
    const productPath = join(root, "packages/config/product.ts");
    mkdirSync(dirname(productPath), { recursive: true });
    writeFileSync(productPath, MULTILINE_PRODUCT_TS, "utf8");

    expect(
      writeProductTagline(root, "Ship product and marketing sites faster"),
    ).toBe(true);

    const next = readFileSync(productPath, "utf8");
    expect(next).toContain(
      'export const PRODUCT_TAGLINE = "Ship product and marketing sites faster";',
    );
    expect(readProductTagline(root)).toBe(
      "Ship product and marketing sites faster",
    );
  });
});
