import { ui, type Appearance } from "@clerk/ui";

/** Pinned Clerk UI bundle — pass to `ClerkProvider` to avoid CDN drift. */
export { ui };

/** Shared Clerk component styling (stable element keys, not DOM structure). */
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
