import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders headings and paragraphs", () => {
    const html = renderMarkdown("## Hello\n\nWorld");
    expect(html).toContain("<h2>Hello</h2>");
    expect(html).toContain("<p>World</p>");
  });

  it("renders fenced code blocks", () => {
    const html = renderMarkdown("```bash\nbun install\n```");
    expect(html).toContain("<pre>");
    expect(html).toContain("bun install");
  });
});
