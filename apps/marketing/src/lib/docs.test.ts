import { describe, expect, it } from "vitest";
import { getAllDocs, getDoc } from "./docs";

describe("docs", () => {
  it("loads template documentation pages in order", () => {
    const docs = getAllDocs();
    expect(docs.length).toBeGreaterThanOrEqual(3);
    expect(docs[0]?.slug).toBe("getting-started");
  });

  it("renders markdown to html for a doc page", () => {
    const doc = getDoc("getting-started");
    expect(doc).toBeDefined();
    expect(doc?.html).toContain("<h2>");
    expect(doc?.html).toContain("Prerequisites");
  });
});
