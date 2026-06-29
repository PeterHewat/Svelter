import { safeSessionGet, safeSessionSet } from "./storage";

/** Session value when the home / logo link is highlighted. */
export const NAV_HOME_HIGHLIGHT = "home";

/**
 * SessionStorage helpers for nav underline continuity across navigations.
 *
 * @param storageKey - App-specific sessionStorage key
 */
export function createNavHighlightPersistence(storageKey: string) {
  return {
    /** @returns Persisted highlight key or `null` */
    read(): string | null {
      return safeSessionGet(storageKey);
    },
    /**
     * @param value - Serialized active link key
     */
    persist(value: string): void {
      safeSessionSet(storageKey, value);
    },
    /** Mark the home / logo link as the last highlight. */
    persistHome(): void {
      safeSessionSet(storageKey, NAV_HOME_HIGHLIGHT);
    },
    /** @param value - Stored highlight key */
    isHome(value: string | null): boolean {
      return value === NAV_HOME_HIGHLIGHT;
    },
  };
}
