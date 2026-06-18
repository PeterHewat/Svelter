import { describe, expect, test } from "bun:test";
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
