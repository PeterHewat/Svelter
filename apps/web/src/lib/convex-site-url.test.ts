import { expect, test } from "vitest";
import { convexSiteUrl } from "./convex-site-url";

test("convexSiteUrl maps cloud deployment to site origin", () => {
  expect(convexSiteUrl("https://happy-animal-123.convex.cloud")).toBe(
    "https://happy-animal-123.convex.site",
  );
});
