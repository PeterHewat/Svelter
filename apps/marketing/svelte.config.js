import adapter from "@sveltejs/adapter-static";
import { bakedApexMarketingOrigin } from "@repo/config/validate-domain";
import { marketingDevOrigin } from "@repo/config/dev-ports";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const apexMarketingOrigin = bakedApexMarketingOrigin(
  process.env.APEX_DOMAIN?.trim(),
);

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
      entries: ["*", "/sitemap.xml"],
      // Apex release only — canonical / hreflang for production SEO.
      origin: apexMarketingOrigin ?? marketingDevOrigin,
    },
  },
};

export default config;
