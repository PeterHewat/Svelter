import adapter from "@sveltejs/adapter-static";
import { marketingDevOrigin } from "@repo/config/dev-ports";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      strict: true,
    }),
    prerender: {
      entries: ["*"],
      // Baked into hreflang / canonical URLs at build time (see deploy-marketing action).
      origin: process.env.PUBLIC_MARKETING_ORIGIN ?? marketingDevOrigin,
    },
  },
};

export default config;
