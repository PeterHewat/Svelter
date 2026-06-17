import { describe, expect, test } from "bun:test";
import {
  parseWranglerAuthTokenJson,
  parseWranglerWhoami,
  parseWranglerWhoamiJson,
} from "./cloudflare-auth";

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
