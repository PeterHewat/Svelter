import { describe, expect, test } from "bun:test";
import {
  cloudflareApiTokenManualSteps,
  parseWranglerAuthTokenJson,
  parseWranglerWhoami,
  parseWranglerWhoamiJson,
  registrarNameserverManualSteps,
  validateCloudflareApiToken,
} from "./cloudflare-auth";

describe("cloudflareApiTokenManualSteps", () => {
  test("uses product name in suggested token label", () => {
    const steps = cloudflareApiTokenManualSteps("Acme");
    expect(steps.some((step) => step.includes('"Acme GitHub Actions"'))).toBe(
      true,
    );
  });

  test("lists deploy and DNS permissions for one long-lived token", () => {
    const steps = cloudflareApiTokenManualSteps();
    expect(steps[0]).toContain("api-tokens");
    expect(steps.some((step) => step.includes("Token name"))).toBe(true);
    expect(steps.some((step) => step.includes("Cloudflare Pages"))).toBe(true);
    expect(steps.some((step) => step.includes("Account Settings"))).toBe(true);
    expect(steps.some((step) => step.includes("Zone → Zone"))).toBe(true);
    expect(steps.some((step) => step.includes("All zones"))).toBe(true);
    expect(
      steps.some((step) => step.includes("Paste the token at the prompt")),
    ).toBe(true);
  });
});

describe("registrarNameserverManualSteps", () => {
  test("lists generic registrar steps with nameservers", () => {
    const steps = registrarNameserverManualSteps([
      "ada.ns.cloudflare.com",
      "bob.ns.cloudflare.com",
    ]);
    expect(steps.some((step) => step.includes("ada.ns.cloudflare.com"))).toBe(
      true,
    );
    expect(steps.some((step) => step.includes("registrar"))).toBe(true);
    expect(steps.some((step) => step.includes("Custom nameservers"))).toBe(
      true,
    );
    expect(steps.some((step) => step.includes("DNSSEC"))).toBe(true);
  });
});

describe("parseWranglerWhoamiJson", () => {
  test("reads logged out state", () => {
    expect(
      parseWranglerWhoamiJson(JSON.stringify({ loggedIn: false })),
    ).toEqual({ loggedIn: false });
  });

  test("reads logged in with account id", () => {
    expect(
      parseWranglerWhoamiJson(
        JSON.stringify({
          loggedIn: true,
          accounts: [{ id: "acc_123" }],
        }),
      ),
    ).toEqual({ loggedIn: true, accountId: "acc_123" });
  });
});

describe("parseWranglerWhoami", () => {
  test("reads account id from accounts array", () => {
    expect(
      parseWranglerWhoami(
        JSON.stringify({ accounts: [{ id: "acc_123", name: "Personal" }] }),
      ).accountId,
    ).toBe("acc_123");
  });

  test("reads account id from account object", () => {
    expect(
      parseWranglerWhoami(JSON.stringify({ account: { id: "acc_456" } }))
        .accountId,
    ).toBe("acc_456");
  });
});

describe("parseWranglerAuthTokenJson", () => {
  test("reads token field", () => {
    expect(
      parseWranglerAuthTokenJson(JSON.stringify({ token: "cf_token_abc" })),
    ).toBe("cf_token_abc");
  });

  test("reads apiToken field", () => {
    expect(
      parseWranglerAuthTokenJson(JSON.stringify({ apiToken: "cf_token_def" })),
    ).toBe("cf_token_def");
  });
});

describe("validateCloudflareApiToken", () => {
  const validToken = "a".repeat(40);

  test("accepts a long alphanumeric token", () => {
    expect(validateCloudflareApiToken(validToken)).toBeNull();
  });

  test("rejects short values", () => {
    expect(validateCloudflareApiToken("short")).not.toBeNull();
  });

  test("rejects Clerk and Google credential shapes", () => {
    const padded = "x".repeat(31);
    expect(validateCloudflareApiToken(`pk_test_${padded}`)).toContain("Clerk");
    expect(validateCloudflareApiToken(`sk_test_${padded}`)).toContain("Clerk");
    expect(validateCloudflareApiToken(`whsec_${padded}`)).toContain("webhook");
    expect(validateCloudflareApiToken(`GOCSPX-${padded}`)).toContain("Google");
    expect(
      validateCloudflareApiToken(
        `${"1".repeat(30)}.apps.googleusercontent.com`,
      ),
    ).toContain("Google");
  });
});
