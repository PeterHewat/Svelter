import { describe, expect, it } from "bun:test";
import {
  clerkDashboardInstanceStep,
  setupStackBadge,
} from "./setup-stack-labels";

describe("setupStackBadge", () => {
  it("labels development and production distinctly", () => {
    expect(setupStackBadge("development")).toContain("Development");
    expect(setupStackBadge("development")).toContain("staging");
    expect(setupStackBadge("production")).toContain("Production");
    expect(setupStackBadge("production")).toContain("release-*");
  });
});

describe("clerkDashboardInstanceStep", () => {
  it("names the Clerk instance", () => {
    expect(clerkDashboardInstanceStep("development")).toContain(
      "**Development**",
    );
    expect(clerkDashboardInstanceStep("production")).toContain(
      "**Production**",
    );
  });
});
