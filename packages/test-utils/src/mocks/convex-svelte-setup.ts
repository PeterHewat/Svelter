/**
 * Vitest setup for convex-svelte — stub Convex client context when needed.
 */
import { vi } from "vitest";

vi.mock("convex-svelte", async (importOriginal) => {
  const actual = await importOriginal<typeof import("convex-svelte")>();
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: undefined,
      isLoading: true,
      error: undefined,
      isStale: false,
    })),
    useConvexClient: vi.fn(),
  };
});
