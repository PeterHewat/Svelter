/** Svelte SSR markers left in prerendered HTML when `csr: false`. */
export const SVELTE_SSR_MARKERS =
  /<!--\[-?\d*-->|<!--\]-->|<!---->|<!--[a-z0-9]{4,}-->/g;

/**
 * Removes Svelte SSR comment markers from prerendered marketing HTML.
 *
 * @param html - Page HTML emitted by the static adapter
 * @returns HTML without hydration markers
 */
export function stripSvelteSsrMarkers(html: string): string {
  return html.replace(SVELTE_SSR_MARKERS, "");
}
