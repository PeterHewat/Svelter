import type { TranslationDictionary } from "@repo/utils";

const it: TranslationDictionary = {
  meta: {
    homeDescription:
      "Template monorepo pronto per la produzione per prodotto e marketing con SvelteKit, Clerk, Convex e Tailwind.",
  },
  nav: {
    main: "Navigazione principale",
    blog: "Blog",
    github: "Vedi su GitHub",
  },
  home: {
    titleSuffix:
      "Monorepo SvelteKit + Convex + Clerk + Tailwind + Bun per app prodotto e sito marketing",
    heroTitle: "Sviluppa più velocemente con {{name}}",
    heroSubtitle:
      "Un template monorepo pronto per la produzione per prodotto e marketing.",
    heroCta: "Leggi il blog",
    featuresTitle: "Funzionalità",
    feature1Title: "SvelteKit ovunque",
    feature1Body:
      "Un unico framework per la SPA prodotto e il sito marketing statico.",
    feature2Title: "Clerk + Convex",
    feature2Body:
      "Autenticazione gestita con provider social e backend Convex in tempo reale.",
    feature3Title: "Deploy snello",
    feature3Body: "Deploy su qualsiasi CDN; Cloudflare Pages preconfigurato.",
  },
  blog: {
    title: "Blog",
    back: "← Torna al blog",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  language: {
    select: "Seleziona lingua",
    hubTitle: "Scegli la tua lingua",
  },
  theme: {
    toggle: "Cambia tema",
    light: "Chiaro",
    dark: "Scuro",
  },
};

export default it;
