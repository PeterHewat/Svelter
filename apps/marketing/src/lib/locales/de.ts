import type { TranslationDictionary } from "@repo/utils";

const de: TranslationDictionary = {
  meta: {
    homeDescription:
      "Produktionsreifes Monorepo-Template für Produkt und Marketing mit SvelteKit, Clerk, Convex und Tailwind.",
  },
  nav: {
    main: "Hauptnavigation",
    blog: "Blog",
    github: "Auf GitHub ansehen",
  },
  home: {
    titleSuffix:
      "SvelteKit + Convex + Clerk + Tailwind + Bun Monorepo für Produkt-App und Marketing-Website",
    heroTitle: "Schneller entwickeln mit {{name}}",
    heroSubtitle:
      "Ein produktionsreifes Monorepo-Template für Produkt und Marketing.",
    heroCta: "Blog lesen",
    featuresTitle: "Funktionen",
    feature1Title: "SvelteKit überall",
    feature1Body:
      "Ein Framework für Ihre Produkt-SPA und statische Marketing-Website.",
    feature2Title: "Clerk + Convex",
    feature2Body:
      "Gehostete Authentifizierung mit Social Login und Echtzeit-Convex-Backend.",
    feature3Title: "Schlankes Deployment",
    feature3Body: "Deploy auf jedem CDN; Cloudflare Pages vorkonfiguriert.",
  },
  blog: {
    title: "Blog",
    back: "← Zurück zum Blog",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  language: {
    select: "Sprache wählen",
    hubTitle: "Wählen Sie Ihre Sprache",
  },
  theme: {
    toggle: "Theme wechseln",
    light: "Hell",
    dark: "Dunkel",
  },
};

export default de;
