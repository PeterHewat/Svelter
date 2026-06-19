import { error } from "@sveltejs/kit";
import { localeEntries } from "$lib/i18n";
import { getAllPosts, getPost } from "$lib/posts";
import type { PageLoad } from "./$types";

export function entries() {
  return localeEntries().flatMap(({ lang }) =>
    getAllPosts().map((post) => ({ lang, slug: post.slug })),
  );
}

export const load: PageLoad = ({ params }) => {
  const post = getPost(params.slug);
  if (!post) {
    error(404, "Post not found");
  }
  return { post };
};
