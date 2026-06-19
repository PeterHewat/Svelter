import { docPageSchema, type DocPageMeta } from "./docs-schema";
import { parseFrontmatter } from "./frontmatter";
import { renderMarkdown } from "./markdown";

const docs = import.meta.glob("../content/docs/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export type DocPage = DocPageMeta & {
  slug: string;
  content: string;
  html: string;
};

function slugFromPath(path: string): string {
  const match = path.match(/\/([^/]+)\.md$/);
  return match?.[1] ?? path;
}

function loadDocs(): DocPage[] {
  return Object.entries(docs)
    .map(([path, raw]) => {
      const { data, content } = parseFrontmatter(raw);
      const meta = docPageSchema.parse(data);
      return {
        ...meta,
        slug: slugFromPath(path),
        content,
        html: renderMarkdown(content),
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

/**
 * Loads all documentation pages sorted by `order`, then title.
 */
export function getAllDocs(): DocPage[] {
  return loadDocs();
}

/**
 * Loads a single documentation page by slug.
 */
export function getDoc(slug: string): DocPage | undefined {
  return getAllDocs().find((doc) => doc.slug === slug);
}

/**
 * Returns documentation slugs for static prerender entries.
 */
export function getDocSlugs(): string[] {
  return getAllDocs().map((doc) => doc.slug);
}
