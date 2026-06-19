import {
  blogPostSchema,
  type BlogPostMeta,
  type BlogPostType,
} from "./blog-schema";
import { parseFrontmatter } from "./frontmatter";
import { renderMarkdown } from "./markdown";

const posts = import.meta.glob("../content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export type BlogPost = BlogPostMeta & {
  slug: string;
  content: string;
  html: string;
};

function slugFromPath(path: string): string {
  const match = path.match(/\/([^/]+)\.md$/);
  return match?.[1] ?? path;
}

function loadPosts(): BlogPost[] {
  return Object.entries(posts)
    .map(([path, raw]) => {
      const { data, content } = parseFrontmatter(raw);
      const meta = blogPostSchema.parse(data);
      return {
        ...meta,
        slug: slugFromPath(path),
        content,
        html: renderMarkdown(content),
      };
    })
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

/**
 * Loads all blog posts sorted by publication date (newest first).
 */
export function getAllPosts(): BlogPost[] {
  return loadPosts();
}

/**
 * Loads blog posts filtered by content type.
 *
 * @param type - When set, only posts of that type; otherwise all posts.
 */
export function getPostsByType(type?: BlogPostType): BlogPost[] {
  const all = loadPosts();
  if (!type) return all;
  return all.filter((post) => post.type === type);
}

/**
 * Loads a single blog post by slug.
 */
export function getPost(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}
