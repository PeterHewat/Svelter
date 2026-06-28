import { redirect } from "@sveltejs/kit";

/**
 * Permanent redirect to a locale-prefixed path with an optional hash fragment.
 *
 * @param lang - Locale segment (e.g. `en`)
 * @param path - Path without locale prefix (e.g. `legal`, empty for homepage)
 * @param fragment - Section id without `#`
 */
export function redirectToLocaleHash(
  lang: string,
  path: string,
  fragment?: string,
): never {
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  const base = trimmed ? `/${lang}/${trimmed}` : `/${lang}`;
  const target = fragment ? `${base}#${fragment.replace(/^#/, "")}` : base;
  redirect(308, target);
}
