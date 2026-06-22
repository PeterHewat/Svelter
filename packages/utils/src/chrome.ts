import { cn, type ClassValue } from "./index";
import { focusRing } from "./focus";

/** Fixed site header shell (web + marketing). */
export const siteHeaderClass =
  "border-border bg-background/80 fixed top-0 right-0 left-0 z-50 w-full border-b backdrop-blur-sm";

/** Primary nav row inside the site header. */
export const siteNavClass =
  "flex w-full items-center justify-between gap-2 px-6 py-3";

/** Main content offset for the fixed header. */
export const siteMainClass = "flex-1 pt-20";

/** Main content with container padding (product web app). */
export const siteMainContainerClass =
  "container mx-auto flex-1 px-4 py-8 pt-20";

/** Site footer bar. */
export const siteFooterClass =
  "border-border text-muted-foreground border-t py-8 text-center text-sm";

/** Primary nav link (brand / home). */
export const navLinkClass = "text-foreground hover:text-primary font-semibold";

/** Secondary nav link or button (blog, tasks, etc.). */
export const navSecondaryLinkClass =
  "text-muted-foreground hover:text-primary cursor-pointer text-sm";

/** Fixed-size slot for the trailing icon action (sign-in, GitHub). */
export const iconSlotClass =
  "flex h-10 w-10 shrink-0 items-center justify-center";

/**
 * Border icon button used in the site chrome (theme, auth, GitHub).
 *
 * @param extra - Additional Tailwind classes
 */
export function iconButtonClass(...extra: ClassValue[]): string {
  return cn(
    "border-border bg-background text-foreground inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border",
    "hover:bg-secondary hover:text-secondary-foreground",
    "disabled:cursor-not-allowed disabled:opacity-50",
    focusRing,
    ...extra,
  );
}

/** Shared language switcher shell (border + hover). */
const languageSwitcherShellClass = cn(
  "border-border bg-background text-foreground inline-flex items-center rounded-md border",
  "hover:bg-secondary hover:text-secondary-foreground",
);

/** Language switcher shell wrapping a native `<select>`. */
export const languageSwitcherBaseClass = cn(
  languageSwitcherShellClass,
  "focus-within:ring-ring focus-within:ring-2",
);

/** Language switcher size variants (matches `@repo/ui-svelte` LanguageSwitcher). */
export const languageSwitcherSizes = {
  sm: "h-8 gap-1.5 px-2 text-sm",
  md: "h-10 gap-2 px-3 text-base",
  lg: "h-12 gap-2 px-4 text-lg",
} as const;

/** Native select inside the language switcher shell. */
export const languageSwitcherSelectClass =
  "text-foreground min-w-0 cursor-pointer appearance-none border-0 bg-transparent focus:outline-none";

/** Icon-only language switcher shell (fixed square, no visible locale label). */
export const languageSwitcherIconOnlyClass =
  "relative w-10 justify-center gap-0 p-0";

/** Native select overlaid on the icon-only switcher (invisible, still clickable). */
export const languageSwitcherOverlaySelectClass = cn(
  languageSwitcherSelectClass,
  "absolute inset-0 cursor-pointer opacity-0",
);

/** `<details>` language menu (marketing, no-JS friendly). */
export const languageSwitcherDetailsClass = cn(
  languageSwitcherBaseClass,
  "relative",
);

/** Summary row inside the language `<details>` menu. */
export const languageSwitcherSummaryClass = cn(
  "flex min-w-0 cursor-pointer list-none items-center gap-2 outline-none [&::-webkit-details-marker]:hidden",
);

/** Icon-only summary that fills the square switcher shell (full hit target). */
export const languageSwitcherIconOnlySummaryClass = cn(
  languageSwitcherSummaryClass,
  "absolute inset-0 flex items-center justify-center gap-0",
);

/** Dropdown panel for locale links. */
export const languageSwitcherMenuClass =
  "border-border bg-background absolute top-full left-0 z-50 mt-1 min-w-full rounded-md border py-1 shadow-md";

/** Reserved slot for the current-locale checkmark in the menu. */
export const languageSwitcherMenuCheckSlotClass =
  "flex h-4 w-4 shrink-0 items-center justify-center";

/** Locale link inside the language menu. */
export const languageSwitcherMenuLinkClass = cn(
  "text-foreground hover:bg-primary/15 flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm",
  focusRing,
);

/** Locale menu row for `<button>` items (matches link styling). */
export const languageSwitcherMenuItemClass = cn(
  languageSwitcherMenuLinkClass,
  "border-0 bg-transparent font-inherit text-left",
);
