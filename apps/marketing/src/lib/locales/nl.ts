import type { TranslationDictionary } from "@repo/utils";

const nl: TranslationDictionary = {
  meta: {
    homeDescription:
      "Productieklaar monorepo-sjabloon voor product en marketing met SvelteKit, Clerk, Convex en Tailwind.",
  },
  nav: {
    main: "Hoofdnavigatie",
    blog: "Blog",
    github: "Bekijk op GitHub",
  },
  home: {
    titleSuffix:
      "SvelteKit + Convex + Clerk + Tailwind + Bun monorepo voor productapp en marketingwebsite",
    heroTitle: "Bouw sneller met {{name}}",
    heroSubtitle:
      "Een productieklaar monorepo-sjabloon voor product en marketing.",
    heroCta: "Lees de blog",
    featuresTitle: "Functies",
    feature1Title: "SvelteKit overal",
    feature1Body:
      "Eén framework voor je product-SPA en statische marketingwebsite.",
    feature2Title: "Clerk + Convex",
    feature2Body:
      "Gehoste authenticatie met social providers en realtime Convex-backend.",
    feature3Title: "Lean deploy",
    feature3Body: "Deploy op elke CDN; Cloudflare Pages vooraf geconfigureerd.",
  },
  blog: {
    title: "Blog",
    back: "← Terug naar blog",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  language: {
    select: "Taal kiezen",
    hubTitle: "Kies uw taal",
  },
  theme: {
    toggle: "Thema wisselen",
    light: "Licht",
    dark: "Donker",
  },
};

export default nl;
