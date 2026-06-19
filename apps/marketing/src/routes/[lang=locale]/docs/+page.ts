import { localeEntries } from "$lib/locale-path";
import type { PageLoad } from "./$types";

export function entries() {
  return localeEntries();
}

export const load: PageLoad = () => {
  return {};
};
