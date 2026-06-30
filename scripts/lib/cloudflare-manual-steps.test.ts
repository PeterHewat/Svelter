import { describe, expect, it } from "bun:test";
import {
  cloudflareDnsAutomationNote,
  cloudflarePagesCustomDomainManualSteps,
} from "./cloudflare-manual-steps";

describe("cloudflarePagesCustomDomainManualSteps", () => {
  it("includes Pages project URLs and hostnames", () => {
    const steps = cloudflarePagesCustomDomainManualSteps(
      "acct",
      "my-web",
      "my-marketing",
      "example.com",
    );
    expect(steps.join("\n")).toContain("example.com");
    expect(steps.join("\n")).toContain("www.example.com");
    expect(steps.join("\n")).toContain("/pages/view/my-web");
    expect(steps.join("\n")).toContain(cloudflareDnsAutomationNote());
  });
});
