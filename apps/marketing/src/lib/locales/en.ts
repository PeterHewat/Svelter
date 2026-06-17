import type { TranslationDictionary } from "@repo/utils";

/** English marketing copy — canonical key set for locale parity. */
const en = {
  meta: {
    homeDescription:
      "A production-ready monorepo template for product and marketing with SvelteKit, Clerk, Convex, and Tailwind.",
  },
  nav: {
    main: "Main navigation",
    blog: "Blog",
    github: "View on GitHub",
  },
  home: {
    titleSuffix:
      "SvelteKit + Convex + Clerk + Tailwind + Bun monorepo starter for your product app and marketing site",
    heroTitle: "Build faster with {{name}}",
    heroSubtitle:
      "A production-ready monorepo template for product and marketing.",
    heroCta: "Read the blog",
    featuresTitle: "Features",
    feature1Title: "SvelteKit Everywhere",
    feature1Body:
      "One framework for your product SPA and static marketing site.",
    feature2Title: "Clerk + Convex",
    feature2Body:
      "Hosted auth with social providers and a realtime Convex backend.",
    feature3Title: "Lean Deploy",
    feature3Body: "Deploys to any CDN; Cloudflare Pages pre-configured.",
  },
  blog: {
    title: "Blog",
    back: "← Back to blog",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  language: {
    select: "Select language",
    hubTitle: "Choose your language",
  },
  theme: {
    toggle: "Toggle theme",
    light: "Light",
    dark: "Dark",
  },
} as const satisfies TranslationDictionary;

export default en;
