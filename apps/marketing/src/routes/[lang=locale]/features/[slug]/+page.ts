import { error } from "@sveltejs/kit";
import { getFeatureBySlug, getFeatureSlugs } from "$lib/marketing-content";
import { redirectToLocaleHash } from "$lib/marketing-redirect";
import { localeEntries } from "$lib/i18n";
import type { PageLoad } from "./$types";

export function entries() {
  return localeEntries().flatMap(({ lang }) =>
    getFeatureSlugs().map((slug) => ({ lang, slug })),
  );
}

export const load: PageLoad = ({ params }) => {
  const feature = getFeatureBySlug(params.slug);
  if (!feature) {
    error(404, "Feature not found");
  }
  redirectToLocaleHash(params.lang, "", feature.slug);
};
