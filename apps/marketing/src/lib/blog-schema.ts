import { z } from "zod";

export const blogPostTypeSchema = z.enum(["article", "changelog"]);

export type BlogPostType = z.infer<typeof blogPostTypeSchema>;

export const blogPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  /** `article` (default) or `changelog` — shown as a badge on blog list/detail. */
  type: blogPostTypeSchema.optional().default("article"),
  /** Changelog release version (e.g. `0.1.0`). */
  version: z.string().optional(),
  author: z.string().optional(),
  image: z.string().optional(),
});

export type BlogPostMeta = z.infer<typeof blogPostSchema>;
