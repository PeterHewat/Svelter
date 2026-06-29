const AVATAR_CACHE_KEY = "svelter-clerk-avatar-url";

/**
 * Reads a cached Clerk avatar URL from session storage.
 *
 * @returns Cached image URL or null
 */
export function readCachedAvatarUrl(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const url = sessionStorage.getItem(AVATAR_CACHE_KEY);
    return url && url.startsWith("http") ? url : null;
  } catch {
    return null;
  }
}

/**
 * Persists the signed-in user's avatar URL for instant paint on refresh.
 *
 * @param url - Clerk profile image URL
 */
export function writeCachedAvatarUrl(url: string): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(AVATAR_CACHE_KEY, url);
  } catch {
    /* ignore quota / privacy mode */
  }
}

/**
 * Clears the cached avatar URL when the user signs out.
 */
export function clearCachedAvatarUrl(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(AVATAR_CACHE_KEY);
  } catch {
    /* ignore */
  }
}
