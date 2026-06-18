import type { Locale } from "@repo/utils/i18n";
import { getFeatureDeepDiveSlugs } from "$lib/marketing-content";
import { localizedPath } from "$lib/locale-path";
import { getAllPosts } from "$lib/posts";

const MARKETING_LOCALES = [
  "en",
  "es",
  "fr",
  "de",
  "pt",
  "it",
  "nl",
  "pl",
  "ru",
] as const satisfies readonly Locale[];

/** Static route segments under `/[lang]/` (no leading slash). */
export const MARKETING_STATIC_ROUTES = [
  "",
  "pricing",
  "features",
  "integrations",
  "customers",
  "security",
  "about",
  "blog",
  "legal/privacy",
  "legal/terms",
] as const;

/**
 * All prerendered marketing paths (locale prefix included, no origin).
 */
export function getMarketingPaths(): string[] {
  const featureSlugs = getFeatureDeepDiveSlugs();
  const postSlugs = getAllPosts().map((post) => post.slug);

  return MARKETING_LOCALES.flatMap((locale) => [
    ...MARKETING_STATIC_ROUTES.map((route) => localizedPath(locale, route)),
    ...featureSlugs.map((slug) => localizedPath(locale, `features/${slug}`)),
    ...postSlugs.map((slug) => localizedPath(locale, `blog/${slug}`)),
  ]);
}

/**
 * Builds sitemap XML for all marketing routes.
 *
 * @param origin - Site origin (e.g. `https://example.com`)
 */
export function buildSitemapXml(origin: string): string {
  const urls = getMarketingPaths()
    .map((path) => {
      const loc = `${origin}${path}`;
      return `  <url><loc>${escapeXml(loc)}</loc></url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
