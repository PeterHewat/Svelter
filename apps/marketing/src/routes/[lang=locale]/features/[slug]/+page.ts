import { error } from "@sveltejs/kit";
import {
  getFeatureDeepDive,
  getFeatureDeepDiveSlugs,
} from "$lib/marketing-content";
import { localeEntries } from "$lib/locale-path";
import type { PageLoad } from "./$types";

export function entries() {
  return localeEntries().flatMap(({ lang }) =>
    getFeatureDeepDiveSlugs().map((slug) => ({ lang, slug })),
  );
}

export const load: PageLoad = ({ params }) => {
  const feature = getFeatureDeepDive(params.slug);
  if (!feature) {
    error(404, "Feature not found");
  }
  return { feature };
};
