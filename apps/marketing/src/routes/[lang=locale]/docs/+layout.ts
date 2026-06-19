import { getAllDocs } from "$lib/docs";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = () => {
  return { docs: getAllDocs() };
};
