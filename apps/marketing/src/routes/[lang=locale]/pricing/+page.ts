import { redirect } from "@sveltejs/kit";
import { localeEntries } from "$lib/i18n";
import type { PageLoad } from "./$types";

export { localeEntries as entries };

export const load: PageLoad = ({ params }) => {
  redirect(308, `/${params.lang}#pricing`);
};
