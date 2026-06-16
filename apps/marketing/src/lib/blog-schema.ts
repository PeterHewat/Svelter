import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  author: z.string().optional(),
  image: z.string().optional(),
});

export type BlogPostMeta = z.infer<typeof blogPostSchema>;
