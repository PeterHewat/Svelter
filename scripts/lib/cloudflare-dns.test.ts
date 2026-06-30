import { afterEach, describe, expect, it, mock } from "bun:test";
import type { CloudflareZone } from "./cloudflare-api";
import {
  ensureCloudflareDnsRecord,
  importClerkDnsRecordsToCloudflare,
} from "./cloudflare-dns";

const zone: CloudflareZone = {
  id: "zone_123",
  name: "example.com",
  status: "active",
  name_servers: ["ada.ns.cloudflare.com"],
};

describe("ensureCloudflareDnsRecord", () => {
  afterEach(() => {
    mock.restore();
  });

  it("updates stale CNAME content for the same host", async () => {
    let patched: unknown;
    globalThis.fetch = mock(async (input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url.includes("/dns_records?") && method === "GET") {
        return new Response(
          JSON.stringify({
            success: true,
            result: [
              {
                id: "rec_old",
                type: "CNAME",
                name: "clkmail.example.com",
                content: "mail.old.clerk.services",
                proxied: false,
              },
            ],
          }),
        );
      }
      if (url.includes("/dns_records/rec_old") && method === "PATCH") {
        patched = JSON.parse(String(init.body));
        return new Response(JSON.stringify({ success: true, result: {} }));
      }
      throw new Error(`unexpected fetch: ${url} ${init?.method ?? "GET"}`);
    }) as typeof fetch;

    const outcome = await ensureCloudflareDnsRecord("token", zone, {
      name: "clkmail.example.com",
      type: "CNAME",
      content: "mail.new.clerk.services",
    });

    expect(outcome).toBe("updated");
    expect(patched).toEqual({
      type: "CNAME",
      name: "clkmail.example.com",
      content: "mail.new.clerk.services",
      proxied: false,
    });
  });

  it("fixes proxied Clerk CNAMEs to DNS-only", async () => {
    globalThis.fetch = mock(async (input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url.includes("/dns_records?") && method === "GET") {
        return new Response(
          JSON.stringify({
            success: true,
            result: [
              {
                id: "rec_proxy",
                type: "CNAME",
                name: "clerk.example.com",
                content: "frontend-api.clerk.services",
                proxied: true,
              },
            ],
          }),
        );
      }
      if (url.includes("/dns_records/rec_proxy") && method === "PATCH") {
        return new Response(JSON.stringify({ success: true, result: {} }));
      }
      throw new Error(`unexpected fetch: ${url}`);
    }) as typeof fetch;

    const outcome = await ensureCloudflareDnsRecord("token", zone, {
      name: "clerk.example.com",
      type: "CNAME",
      content: "frontend-api.clerk.services",
    });

    expect(outcome).toBe("fixed_proxy");
  });
});

describe("importClerkDnsRecordsToCloudflare", () => {
  afterEach(() => {
    mock.restore();
  });

  it("counts created, updated, and unchanged records", async () => {
    const state = new Map<
      string,
      { id: string; content: string; proxied: boolean }
    >([
      [
        "clkmail.example.com",
        {
          id: "1",
          content: "mail.old.clerk.services",
          proxied: false,
        },
      ],
      [
        "clerk.example.com",
        {
          id: "2",
          content: "frontend-api.clerk.services",
          proxied: false,
        },
      ],
    ]);

    globalThis.fetch = mock(async (input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url.includes("/dns_records?") && method === "GET") {
        const name = decodeURIComponent(url.split("name=")[1] ?? "");
        const row = state.get(name);
        if (!row) {
          return new Response(JSON.stringify({ success: true, result: [] }));
        }
        return new Response(
          JSON.stringify({
            success: true,
            result: [
              {
                id: row.id,
                type: "CNAME",
                name,
                content: row.content,
                proxied: row.proxied,
              },
            ],
          }),
        );
      }
      if (url.endsWith("/dns_records") && method === "POST") {
        return new Response(JSON.stringify({ success: true, result: {} }));
      }
      if (url.includes("/dns_records/") && method === "PATCH") {
        const id = url.split("/dns_records/")[1];
        for (const [name, row] of state) {
          if (row.id === id) {
            const body = JSON.parse(String(init.body)) as { content: string };
            state.set(name, { ...row, content: body.content });
          }
        }
        return new Response(JSON.stringify({ success: true, result: {} }));
      }
      throw new Error(`unexpected fetch: ${url}`);
    }) as typeof fetch;

    const summary = await importClerkDnsRecordsToCloudflare("token", zone, [
      {
        name: "clkmail.example.com",
        type: "CNAME",
        content: "mail.new.clerk.services",
      },
      {
        name: "clerk.example.com",
        type: "CNAME",
        content: "frontend-api.clerk.services",
      },
      {
        name: "accounts.example.com",
        type: "CNAME",
        content: "accounts.clerk.services",
      },
    ]);

    expect(summary).toEqual({
      created: 1,
      updated: 1,
      fixedProxy: 0,
      existing: 1,
    });
  });
});
