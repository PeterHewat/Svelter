import { describe, expect, test } from "vitest";
import {
  defaultE2eEmail,
  E2E_EMAIL_WITHOUT_APEX,
  isPlaceholderE2eEmail,
} from "./e2e-auth";

describe("defaultE2eEmail", () => {
  test("derives e2e.test@ from apex domain", () => {
    expect(defaultE2eEmail("foobar.com")).toBe("e2e.test@foobar.com");
  });

  test("normalizes apex input", () => {
    expect(defaultE2eEmail("  FOOBAR.COM. ")).toBe("e2e.test@foobar.com");
  });

  test("uses a generic fallback when apex is not configured", () => {
    expect(defaultE2eEmail()).toBe(E2E_EMAIL_WITHOUT_APEX);
    expect(defaultE2eEmail("")).toBe(E2E_EMAIL_WITHOUT_APEX);
  });
});

describe("isPlaceholderE2eEmail", () => {
  test("flags template and empty values", () => {
    expect(isPlaceholderE2eEmail(undefined)).toBe(true);
    expect(isPlaceholderE2eEmail("")).toBe(true);
    expect(isPlaceholderE2eEmail("e2e.test@your-domain.com")).toBe(true);
    expect(isPlaceholderE2eEmail("e2e.test@your-apex-domain")).toBe(true);
  });

  test("accepts setup fallback and apex-derived addresses", () => {
    expect(isPlaceholderE2eEmail(E2E_EMAIL_WITHOUT_APEX)).toBe(false);
    expect(isPlaceholderE2eEmail("e2e.test@foobar.com")).toBe(false);
  });
});
