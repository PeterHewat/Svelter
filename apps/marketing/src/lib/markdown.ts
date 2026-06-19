import { Marked } from "marked";

const marked = new Marked({ gfm: true, breaks: false });

/**
 * Renders Markdown to HTML at build/prerender time.
 * Content is authored in-repo — not user-generated.
 *
 * @param content - Markdown body (without frontmatter)
 * @returns HTML string safe to render with `{@html}` in Svelte
 */
export function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}
