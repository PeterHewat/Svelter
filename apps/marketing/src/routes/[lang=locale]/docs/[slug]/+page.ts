import { error } from "@sveltejs/kit";
import { getAllDocs, getDoc } from "$lib/docs";
import { localeEntries } from "$lib/locale-path";
import type { PageLoad } from "./$types";

export function entries() {
  return localeEntries().flatMap(({ lang }) =>
    getAllDocs().map((doc) => ({ lang, slug: doc.slug })),
  );
}

export const load: PageLoad = ({ params }) => {
  const doc = getDoc(params.slug);
  if (!doc) {
    error(404, "Doc not found");
  }
  return { doc };
};
