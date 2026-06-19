export { localeEntries as entries } from "$lib/i18n";

import { getAllPosts } from "$lib/posts";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => {
  return { posts: getAllPosts() };
};
