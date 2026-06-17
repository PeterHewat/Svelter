import type { LayoutLoad } from "./$types";
import type { Locale } from "$lib/i18n";

export const load: LayoutLoad = ({ params, url }) => {
  return {
    lang: params.lang as Locale,
    pathname: url.pathname,
    origin: url.origin,
  };
};
