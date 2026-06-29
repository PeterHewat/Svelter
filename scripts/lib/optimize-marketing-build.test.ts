import { describe, expect, test } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { removeHashFragmentHtmlArtifacts } from "./optimize-marketing-build";
import {
  stripSvelteSsrMarkers,
  SVELTE_SSR_MARKERS,
} from "./optimize-marketing-html";

describe("stripSvelteSsrMarkers", () => {
  test("removes Svelte SSR and fingerprint comments", () => {
    const html = `<!doctype html><body><!--[--><!--[0--><div>Hi</div><!--]--><!--[-1--><!--]--><!----><!--sp5bfr--></body>`;
    expect(stripSvelteSsrMarkers(html)).toBe(
      "<!doctype html><body><div>Hi</div></body>",
    );
  });

  test("leaves ordinary HTML comments intact", () => {
    const html = "<!-- real comment --><p>ok</p>";
    expect(stripSvelteSsrMarkers(html)).toBe(html);
  });

  test("SSR marker regex matches expected shapes", () => {
    for (const marker of [
      "<!--[-->",
      "<!--]-->",
      "<!--[0-->",
      "<!--[-1-->",
      "<!---->",
      "<!--sp5bfr-->",
    ]) {
      expect(marker.replace(SVELTE_SSR_MARKERS, "")).toBe("");
    }
  });
});

describe("removeHashFragmentHtmlArtifacts", () => {
  test("deletes hash-suffixed HTML files but keeps base pages", () => {
    const dir = mkdtempSync(join(tmpdir(), "marketing-build-"));
    try {
      writeFileSync(join(dir, "legal.html"), "<html></html>");
      writeFileSync(join(dir, "legal#privacy.html"), "<html></html>");
      mkdirSync(join(dir, "en"));
      writeFileSync(join(dir, "en", "legal.html"), "<html></html>");
      writeFileSync(join(dir, "en", "legal#terms.html"), "<html></html>");

      removeHashFragmentHtmlArtifacts(dir);

      expect(existsSync(join(dir, "legal.html"))).toBe(true);
      expect(existsSync(join(dir, "legal#privacy.html"))).toBe(false);
      expect(existsSync(join(dir, "en", "legal.html"))).toBe(true);
      expect(existsSync(join(dir, "en", "legal#terms.html"))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
