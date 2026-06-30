import { describe, expect, it } from "bun:test";
import {
  clerkPendingDnsRecordsToBind,
  parseClerkDeployStatusReport,
} from "./clerk-deploy-status";

describe("parseClerkDeployStatusReport", () => {
  it("parses a complete deploy status report", () => {
    const report = parseClerkDeployStatusReport(
      JSON.stringify({
        complete: true,
        state: "complete",
        domain: "example.com",
        productionInstanceId: "ins_prod",
        domainStatus: { dns: "complete", ssl: "complete", mail: "complete" },
        pendingDnsRecords: [],
        oauth: {
          complete: true,
          configured: ["google"],
          pending: [],
          unsupported: [],
        },
        nextAction: "",
      }),
    );
    expect(report?.complete).toBe(true);
    expect(report?.state).toBe("complete");
    expect(report?.domain).toBe("example.com");
  });

  it("parses pending DNS records", () => {
    const report = parseClerkDeployStatusReport(
      JSON.stringify({
        complete: false,
        state: "domain_pending",
        domain: "example.com",
        productionInstanceId: "ins_prod",
        domainStatus: { dns: "pending", ssl: "complete", mail: "complete" },
        pendingDnsRecords: [
          {
            type: "CNAME",
            host: "clerk.example.com",
            value: "frontend-api.clerk.services",
          },
        ],
        oauth: {
          complete: true,
          configured: ["google"],
          pending: [],
          unsupported: [],
        },
        nextAction: "Sync DNS records",
      }),
    );
    expect(report?.state).toBe("domain_pending");
    expect(report?.pendingDnsRecords).toEqual([
      {
        type: "CNAME",
        host: "clerk.example.com",
        value: "frontend-api.clerk.services",
      },
    ]);
  });

  it("returns null for non-JSON stdout", () => {
    expect(parseClerkDeployStatusReport("not json")).toBeNull();
  });
});

describe("clerkPendingDnsRecordsToBind", () => {
  it("maps deploy status rows to BIND records", () => {
    expect(
      clerkPendingDnsRecordsToBind([
        {
          type: "CNAME",
          host: "clerk.example.com.",
          value: "frontend-api.clerk.services.",
        },
      ]),
    ).toEqual([
      {
        name: "clerk.example.com",
        type: "CNAME",
        content: "frontend-api.clerk.services",
      },
    ]);
  });
});
