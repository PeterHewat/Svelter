import { beforeEach, describe, expect, test, vi } from "vitest";

const { setupConvex } = vi.hoisted(() => ({
  setupConvex: vi.fn(),
}));

vi.mock("$lib/backend", () => ({
  isBackendEnabled: vi.fn(),
}));

vi.mock("$lib/web-env", () => ({
  loadWebEnv: vi.fn(),
}));

vi.mock("convex-svelte", () => ({
  setupConvex,
}));

import { isBackendEnabled } from "$lib/backend";
import { loadWebEnv } from "$lib/web-env";
import { initConvexFromEnv } from "./init-convex-from-env";

describe("initConvexFromEnv", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("skips when the backend is disabled", () => {
    vi.mocked(isBackendEnabled).mockReturnValue(false);
    initConvexFromEnv();
    expect(setupConvex).not.toHaveBeenCalled();
  });

  test("calls setupConvex with the deployment URL", () => {
    vi.mocked(isBackendEnabled).mockReturnValue(true);
    vi.mocked(loadWebEnv).mockReturnValue({
      convexUrl: "https://example.convex.cloud",
      clerkPublishableKey: "pk_test",
    });

    initConvexFromEnv();

    expect(setupConvex).toHaveBeenCalledWith("https://example.convex.cloud");
  });
});
