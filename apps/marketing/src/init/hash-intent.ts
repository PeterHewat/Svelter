import { HASH_INTENT_KEY } from "./constants";

/**
 * Record that the current hash came from user navigation (load or anchor click),
 * not scroll-spy `replaceState`.
 *
 * @param hash - Hash string including `#`
 */
export function markHashIntent(hash) {
  if (!hash || hash.charAt(0) !== "#") {
    return;
  }
  try {
    sessionStorage.setItem(HASH_INTENT_KEY, hash);
  } catch {
    /* ignore */
  }
}

/**
 * @param hash - Hash string including `#`
 * @returns Whether the hash was explicitly chosen by the user
 */
export function hasHashIntent(hash) {
  if (!hash) {
    return false;
  }
  try {
    return sessionStorage.getItem(HASH_INTENT_KEY) === hash;
  } catch {
    return false;
  }
}
