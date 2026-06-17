import { localeEntries } from "$lib/locale-path";
import { getAllPosts } from "$lib/posts";
import type { PageLoad } from "./$types";

export function entries() {
  return localeEntries();
}

export const load: PageLoad = () => {
  return { posts: getAllPosts() };
};
