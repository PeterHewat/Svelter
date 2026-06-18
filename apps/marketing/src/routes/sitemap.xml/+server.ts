import { buildSitemapXml } from "$lib/marketing-routes";

export const prerender = true;

/** Prerendered `sitemap.xml` for all marketing locales and routes. */
export function GET({ url }: { url: URL }): Response {
  const body = buildSitemapXml(url.origin);
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=0, must-revalidate",
    },
  });
}
