import { describe, expect, test } from "bun:test";
import {
  clerkCnameTargetsToBindRecords,
  findClerkDomainForApex,
  parseClerkDomainsListResponse,
} from "./clerk-domain-dns";

describe("parseClerkDomainsListResponse", () => {
  test("accepts a bare array", () => {
    expect(
      parseClerkDomainsListResponse([
        { name: "extractora.com", cname_targets: [] },
      ]),
    ).toHaveLength(1);
  });

  test("accepts paginated data wrapper", () => {
    expect(
      parseClerkDomainsListResponse({
        data: [{ name: "extractora.com", cname_targets: [] }],
        total_count: 1,
      }),
    ).toHaveLength(1);
  });
});

describe("findClerkDomainForApex", () => {
  test("prefers the non-satellite apex domain", () => {
    const domain = findClerkDomainForApex(
      [
        {
          name: "satellite.extractora.com",
          is_satellite: true,
          cname_targets: [{ host: "satellite.extractora.com", value: "x" }],
        },
        {
          name: "extractora.com",
          is_satellite: false,
          cname_targets: [{ host: "clerk.extractora.com", value: "y" }],
        },
      ],
      "extractora.com",
    );
    expect(domain?.name).toBe("extractora.com");
  });
});

describe("clerkCnameTargetsToBindRecords", () => {
  test("maps Clerk API targets to BIND records", () => {
    expect(
      clerkCnameTargetsToBindRecords([
        {
          host: "clerk.extractora.com",
          value: "frontend-api.clerk.services.",
          required: true,
        },
      ]),
    ).toEqual([
      {
        name: "clerk.extractora.com",
        type: "CNAME",
        content: "frontend-api.clerk.services",
      },
    ]);
  });
});
