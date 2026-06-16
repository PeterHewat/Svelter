import { describe, expect, it } from "bun:test";
import {
  clerkAppMatchesProductName,
  clerkAppsCreateArgs,
  extractClerkAppId,
  isClerkProductionMissingError,
  parseClerkAppRecords,
  parseClerkAppsList,
  parseClerkAppsListPlain,
} from "./clerk-cli";

describe("extractClerkAppId", () => {
  it("finds app IDs in plain text", () => {
    expect(extractClerkAppId("Linked application: app_2abc123xyz")).toBe(
      "app_2abc123xyz",
    );
  });

  it("returns undefined when absent", () => {
    expect(extractClerkAppId("not linked")).toBeUndefined();
  });
});

describe("isClerkProductionMissingError", () => {
  it("detects instance_not_found from Clerk CLI", () => {
    expect(
      isClerkProductionMissingError('{"error":"instance_not_found"}'),
    ).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isClerkProductionMissingError("network timeout")).toBe(false);
  });
});

describe("parseClerkAppsList", () => {
  it("parses array JSON", () => {
    expect(
      parseClerkAppsList(
        JSON.stringify([
          { id: "app_abc", name: "My App" },
          { id: "app_def", slug: "other" },
        ]),
      ),
    ).toEqual([
      { id: "app_abc", name: "My App" },
      { id: "app_def", name: "other" },
    ]);
  });
});

describe("clerkAppsCreateArgs", () => {
  it("uses positional name, not --name", () => {
    expect(clerkAppsCreateArgs("Svelter")).toEqual([
      "apps",
      "create",
      "Svelter",
    ]);
    expect(clerkAppsCreateArgs("My App", true)).toEqual([
      "apps",
      "create",
      "My App",
      "--json",
    ]);
  });
});

describe("clerkAppMatchesProductName", () => {
  it("matches case-insensitively", () => {
    expect(clerkAppMatchesProductName({ name: "Svelter" }, "svelter")).toBe(
      true,
    );
    expect(clerkAppMatchesProductName({ name: "Other App" }, "Svelter")).toBe(
      false,
    );
  });
});

describe("parseClerkAppsListPlain", () => {
  it("parses the human-readable apps table", () => {
    expect(
      parseClerkAppsListPlain(`NAME     APP ID                           ENVIRONMENTS
Svelter  app_example123  development

1 application`),
    ).toEqual([{ id: "app_example123", name: "Svelter" }]);
  });
});

describe("parseClerkAppRecords", () => {
  it("parses development publishable keys", () => {
    expect(
      parseClerkAppRecords(
        JSON.stringify({
          applications: [
            {
              application_id: "app_example123",
              name: "Svelter",
              instances: [
                {
                  environment_type: "development",
                  publishable_key: "pk_test_abc",
                },
              ],
            },
          ],
        }),
      ),
    ).toEqual([
      {
        id: "app_example123",
        name: "Svelter",
        developmentPublishableKey: "pk_test_abc",
      },
    ]);
  });
});
