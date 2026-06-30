import { describe, expect, it } from "bun:test";
import { assessSetupPipelineStatus } from "./setup-pipeline-status";

const baseConfig = {
  productName: "My App",
  productTagLine: "Tag",
  github: {
    org: "acme",
    repo: "my-app",
    labelsSynced: true,
    syncedSecrets: {
      repo: true,
      cloudflare: true,
      production: true,
    },
  },
  cloudflare: {
    synced: true,
    dnsConfigured: true,
    accountId: "acc",
    projectNameWeb: "my-app-web",
    projectNameMarketing: "my-app-marketing",
  },
};

describe("assessSetupPipelineStatus", () => {
  it("reports ready when development and production pipelines are synced", () => {
    const status = assessSetupPipelineStatus({
      ...baseConfig,
      apexDomain: "example.com",
    });
    expect(status.developmentReady).toBe(true);
    expect(status.productionReady).toBe(true);
  });

  it("requires GitHub CI and Cloudflare for the development pipeline", () => {
    const status = assessSetupPipelineStatus({
      ...baseConfig,
      github: {
        ...baseConfig.github,
        syncedSecrets: { cloudflare: true },
        labelsSynced: true,
      },
      cloudflare: undefined,
    });
    expect(status.developmentReady).toBe(false);
    expect(status.developmentMissing.join(" ")).toContain("repository secrets");
    expect(status.developmentMissing.join(" ")).toContain("Cloudflare Pages");
  });

  it("lists production follow-ups when production secrets are missing", () => {
    const status = assessSetupPipelineStatus({
      ...baseConfig,
      github: {
        ...baseConfig.github,
        syncedSecrets: {
          repo: true,
          cloudflare: true,
        },
      },
      apexDomain: undefined,
      cloudflare: {
        ...baseConfig.cloudflare,
        dnsConfigured: false,
      },
    });
    expect(status.developmentReady).toBe(true);
    expect(status.productionReady).toBe(false);
    expect(status.productionMissing[0]).toContain("re-run `bun run setup`");
  });
});
