import { cn, type ClassValue } from "@repo/utils";

/** Size variants for icons inside {@link chromeIconClass} buttons (matches `iconButtonClass`). */
export const chromeIconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

/** Default classes for stroke icons inside chrome icon buttons. Inherits color from the button. */
export function chromeIconClass(...extra: ClassValue[]): string {
  return cn("h-5 w-5 shrink-0", ...extra);
}

/** Checkmark icon inside language menu rows. */
export function chromeMenuCheckIconClass(...extra: ClassValue[]): string {
  return cn("text-muted-foreground h-4 w-4 shrink-0", ...extra);
}
