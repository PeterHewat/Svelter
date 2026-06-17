import { describe, expect, test } from "bun:test";
import {
  bunWorkspaceCliInstallHint,
  ghInstallHint,
  globalCliInstallHint,
} from "./cli-install-hints";

describe("ghInstallHint", () => {
  test("includes brew on darwin", () => {
    const original = process.platform;
    Object.defineProperty(process, "platform", { value: "darwin" });
    expect(ghInstallHint()).toContain("brew install gh");
    Object.defineProperty(process, "platform", { value: original });
  });

  test("links docs on non-darwin", () => {
    const original = process.platform;
    Object.defineProperty(process, "platform", { value: "linux" });
    expect(ghInstallHint()).toContain("cli.github.com");
    Object.defineProperty(process, "platform", { value: original });
  });
});

describe("bunWorkspaceCliInstallHint", () => {
  test("mentions bun install and package name", () => {
    const hint = bunWorkspaceCliInstallHint(
      "wrangler",
      "https://developers.cloudflare.com/workers/wrangler/",
    );
    expect(hint).toContain("bun install");
    expect(hint).toContain("wrangler");
    expect(hint).toContain("developers.cloudflare.com");
  });
});

describe("globalCliInstallHint", () => {
  test("includes brew formula on darwin", () => {
    const original = process.platform;
    Object.defineProperty(process, "platform", { value: "darwin" });
    expect(
      globalCliInstallHint("Node", "node", "https://nodejs.org/"),
    ).toContain("brew install node");
    Object.defineProperty(process, "platform", { value: original });
  });
});
