import {
  blogPostSchema,
  type BlogPostMeta,
  type BlogPostType,
} from "$lib/blog-schema";
import { createMarkdownCollection } from "$lib/markdown-collection";

const collection = createMarkdownCollection({
  glob: import.meta.glob("../content/blog/*.md", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>,
  schema: blogPostSchema,
  sort: (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
});

export type BlogPost = BlogPostMeta & {
  slug: string;
  content: string;
  html: string;
};

/**
 * Loads all blog posts sorted by publication date (newest first).
 */
export function getAllPosts(): BlogPost[] {
  return collection.getAll();
}

/**
 * Loads blog posts filtered by content type.
 *
 * @param type - When set, only posts of that type; otherwise all posts.
 */
export function getPostsByType(type?: BlogPostType): BlogPost[] {
  const all = collection.getAll();
  if (!type) return all;
  return all.filter((post) => post.type === type);
}

/**
 * Loads a single blog post by slug.
 */
export function getPost(slug: string): BlogPost | undefined {
  return collection.getBySlug(slug);
}
