import type { TranslationDictionary } from "@repo/utils";

const pl: TranslationDictionary = {
  meta: {
    homeDescription:
      "Gotowy szablon monorepo do produktu i marketingu z SvelteKit, Clerk, Convex i Tailwind.",
  },
  nav: {
    main: "Nawigacja główna",
    blog: "Blog",
    github: "Zobacz na GitHubie",
  },
  home: {
    titleSuffix:
      "Monorepo SvelteKit + Convex + Clerk + Tailwind + Bun dla aplikacji produktowej i strony marketingowej",
    heroTitle: "Buduj szybciej z {{name}}",
    heroSubtitle: "Gotowy szablon monorepo do produktu i marketingu.",
    heroCta: "Czytaj blog",
    featuresTitle: "Funkcje",
    feature1Title: "SvelteKit wszędzie",
    feature1Body:
      "Jeden framework dla SPA produktowej i statycznej strony marketingowej.",
    feature2Title: "Clerk + Convex",
    feature2Body:
      "Hostowane uwierzytelnianie z logowaniem społecznościowym i backendem Convex w czasie rzeczywistym.",
    feature3Title: "Lekkie wdrożenie",
    feature3Body: "Deploy na dowolnym CDN; Vercel wstępnie skonfigurowany.",
  },
  blog: {
    title: "Blog",
    back: "← Wróć do bloga",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  language: {
    select: "Wybierz język",
    hubTitle: "Wybierz język",
  },
  theme: {
    toggle: "Przełącz motyw",
    light: "Jasny",
    dark: "Ciemny",
  },
};

export default pl;
