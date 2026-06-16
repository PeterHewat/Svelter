import { describe, expect, test } from "bun:test";
import { convexDevOnceArgs } from "./link-convex";
import { productNameToSlug } from "./repo-identity";

describe("convexDevOnceArgs", () => {
  test("builds plain push args", () => {
    expect(convexDevOnceArgs()).toEqual(["convex", "dev", "--once"]);
  });

  test("builds existing-project link args with slug", () => {
    expect(
      convexDevOnceArgs({ configure: "existing", project: "svelter" }),
    ).toEqual([
      "convex",
      "dev",
      "--once",
      "--configure",
      "existing",
      "--project",
      "svelter",
    ]);
  });

  test("builds new-project create args with display name", () => {
    expect(convexDevOnceArgs({ configure: "new", project: "Svelter" })).toEqual(
      ["convex", "dev", "--once", "--configure", "new", "--project", "Svelter"],
    );
  });
});

describe("Convex project slug from setup", () => {
  test("maps product name Svelter to svelter slug", () => {
    expect(productNameToSlug("Svelter")).toBe("svelter");
  });
});
