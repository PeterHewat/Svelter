import type { z } from "zod";
import { parseFrontmatter } from "$lib/frontmatter";
import { renderMarkdown } from "$lib/markdown";

function slugFromPath(path: string): string {
  const match = path.match(/\/([^/]+)\.md$/);
  return match?.[1] ?? path;
}

type MarkdownCollectionOptions<TSchema extends z.ZodType> = {
  glob: Record<string, string>;
  schema: TSchema;
  sort: (
    a: z.infer<TSchema> & { slug: string },
    b: z.infer<TSchema> & { slug: string },
  ) => number;
};

export type MarkdownCollectionItem<TMeta> = TMeta & {
  slug: string;
  content: string;
  html: string;
};

/**
 * Builds a typed markdown content loader from `import.meta.glob` output.
 */
export function createMarkdownCollection<TSchema extends z.ZodType>(
  options: MarkdownCollectionOptions<TSchema>,
) {
  type Item = MarkdownCollectionItem<z.infer<TSchema>>;

  let cache: Item[] | undefined;

  function load(): Item[] {
    if (cache) return cache;

    cache = Object.entries(options.glob)
      .map(([path, raw]) => {
        const { data, content } = parseFrontmatter(raw);
        const meta = options.schema.parse(data) as z.infer<TSchema>;
        const item = Object.assign({}, meta, {
          slug: slugFromPath(path),
          content,
          html: renderMarkdown(content),
        });
        return item as Item;
      })
      .sort(options.sort);

    return cache;
  }

  return {
    getAll: (): Item[] => load(),
    getBySlug: (slug: string): Item | undefined =>
      load().find((item) => item.slug === slug),
    getSlugs: (): string[] => load().map((item) => item.slug),
  };
}
