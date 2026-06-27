import { ui as clerkUi, type Appearance } from "@clerk/ui";
import type { ComponentProps } from "svelte";
import { ClerkProvider } from "svelte-clerk/client";

type ClerkProviderUi = ComponentProps<typeof ClerkProvider>["ui"];

/**
 * Pinned Clerk UI bundle — pass to `ClerkProvider` to avoid CDN drift.
 *
 * Cast bridges minor `@clerk/ui` / `svelte-clerk` Clerk type skew at compile time.
 */
export const ui = clerkUi as unknown as ClerkProviderUi;

/** Focus ring for header UserButton; sizing lives in auth-account-clerk-button CSS. */
export const clerkAppearance: Appearance = {
  elements: {
    userButtonTrigger: {
      "&:focus-visible": {
        outline: "none",
        boxShadow: "0 0 0 2px hsl(var(--ring))",
      },
    },
  },
};
