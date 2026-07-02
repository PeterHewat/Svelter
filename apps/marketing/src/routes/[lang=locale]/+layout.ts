import type { Locale } from "$lib/i18n";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = ({ params, url }) => {
  return {
    lang: params.lang as Locale,
    pathname: url.pathname,
    origin: url.origin,
  };
};
