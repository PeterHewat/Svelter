import { error } from "@sveltejs/kit";
import { getAllPosts, getPost } from "$lib/posts";
import type { PageLoad } from "./$types";

export function entries() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export const load: PageLoad = ({ params }) => {
  const post = getPost(params.slug);
  if (!post) {
    error(404, "Post not found");
  }
  return { post };
};
