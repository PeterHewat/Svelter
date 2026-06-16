import { blogPostSchema, type BlogPostMeta } from "./blog-schema";
import { parseFrontmatter } from "./frontmatter";

const posts = import.meta.glob("../content/blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export type BlogPost = BlogPostMeta & {
  slug: string;
  content: string;
};

function slugFromPath(path: string): string {
  const match = path.match(/\/([^/]+)\.md$/);
  return match?.[1] ?? path;
}

/**
 * Loads all blog posts sorted by publication date (newest first).
 */
export function getAllPosts(): BlogPost[] {
  return Object.entries(posts)
    .map(([path, raw]) => {
      const { data, content } = parseFrontmatter(raw);
      const meta = blogPostSchema.parse(data);
      return { ...meta, slug: slugFromPath(path), content };
    })
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

/**
 * Loads a single blog post by slug.
 */
export function getPost(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}
