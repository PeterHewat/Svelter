import { localeEntries } from "$lib/i18n";
import { redirectToLocaleHash } from "$lib/marketing-redirect";
import type { PageLoad } from "./$types";

export { localeEntries as entries };

export const load: PageLoad = ({ params }) => {
  redirectToLocaleHash(params.lang, "", "pricing");
};
