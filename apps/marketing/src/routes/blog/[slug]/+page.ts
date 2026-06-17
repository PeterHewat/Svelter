import { getAllPosts } from "$lib/posts";
import type { PageLoad } from "./$types";

export function entries() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export const load: PageLoad = ({ params }) => {
  return { slug: params.slug };
};
