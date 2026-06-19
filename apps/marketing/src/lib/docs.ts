import { docPageSchema, type DocPageMeta } from "$lib/docs-schema";
import { createMarkdownCollection } from "$lib/markdown-collection";

const collection = createMarkdownCollection({
  glob: import.meta.glob("../content/docs/*.md", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>,
  schema: docPageSchema,
  sort: (a, b) => a.order - b.order || a.title.localeCompare(b.title),
});

export type DocPage = DocPageMeta & {
  slug: string;
  content: string;
  html: string;
};

/**
 * Loads all documentation pages sorted by `order`, then title.
 */
export function getAllDocs(): DocPage[] {
  return collection.getAll();
}

/**
 * Loads a single documentation page by slug.
 */
export function getDoc(slug: string): DocPage | undefined {
  return collection.getBySlug(slug);
}

/**
 * Returns documentation slugs for static prerender entries.
 */
export function getDocSlugs(): string[] {
  return collection.getSlugs();
}
