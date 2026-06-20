import { expect, test } from "vitest";
import { convexSiteUrlFromCloudUrl } from "./sync-anon-auth";

test("convexSiteUrlFromCloudUrl maps cloud deployment to site origin", () => {
  expect(
    convexSiteUrlFromCloudUrl("https://happy-animal-123.convex.cloud"),
  ).toBe("https://happy-animal-123.convex.site");
});
