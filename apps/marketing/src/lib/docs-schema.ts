import { z } from "zod";

export const docPageSchema = z.object({
  title: z.string(),
  description: z.string(),
  /** Sidebar sort order (lower first). */
  order: z.coerce.number().optional().default(0),
});

export type DocPageMeta = z.infer<typeof docPageSchema>;
