import { describe, expect, test } from "bun:test";
import {
  CloudflareApiError,
  formatCloudflareApiError,
  isCloudflareAlreadyExistsError,
} from "./cloudflare-api";

describe("formatCloudflareApiError", () => {
  test("extracts message from JSON body", () => {
    const err = new CloudflareApiError(
      "failed",
      400,
      JSON.stringify({
        success: false,
        errors: [{ code: 8000001, message: "Project already exists" }],
      }),
    );
    expect(formatCloudflareApiError(err)).toBe("Project already exists");
  });
});

describe("isCloudflareAlreadyExistsError", () => {
  test("detects duplicate project errors", () => {
    const err = new CloudflareApiError(
      "failed",
      409,
      JSON.stringify({
        errors: [
          { code: 8000001, message: "A project with this name already exists" },
        ],
      }),
    );
    expect(isCloudflareAlreadyExistsError(err)).toBe(true);
  });

  test("detects Pages custom domain already attached", () => {
    const err = new CloudflareApiError(
      "failed",
      400,
      JSON.stringify({
        errors: [
          {
            code: 8000018,
            message:
              "You have already added this custom domain. Select another custom domain or check your project configuration.",
          },
        ],
      }),
    );
    expect(isCloudflareAlreadyExistsError(err)).toBe(true);
  });
});
