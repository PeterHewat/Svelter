import type { TranslationDictionary } from "@repo/utils";

const fr: TranslationDictionary = {
  meta: {
    homeDescription:
      "Modèle monorepo prêt pour la production pour produit et marketing avec SvelteKit, Clerk, Convex et Tailwind.",
  },
  nav: {
    main: "Navigation principale",
    blog: "Blog",
    github: "Voir sur GitHub",
  },
  home: {
    titleSuffix:
      "Monorepo SvelteKit + Convex + Clerk + Tailwind + Bun pour votre app produit et site marketing",
    heroTitle: "Développez plus vite avec {{name}}",
    heroSubtitle:
      "Un modèle monorepo prêt pour la production pour produit et marketing.",
    heroCta: "Lire le blog",
    featuresTitle: "Fonctionnalités",
    feature1Title: "SvelteKit partout",
    feature1Body:
      "Un seul framework pour votre SPA produit et votre site marketing statique.",
    feature2Title: "Clerk + Convex",
    feature2Body:
      "Authentification hébergée avec fournisseurs sociaux et backend Convex temps réel.",
    feature3Title: "Déploiement léger",
    feature3Body:
      "Déploiement sur n'importe quel CDN ; Cloudflare Pages préconfiguré.",
  },
  blog: {
    title: "Blog",
    back: "← Retour au blog",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  language: {
    select: "Choisir la langue",
    hubTitle: "Choisissez votre langue",
  },
  theme: {
    toggle: "Changer de thème",
    light: "Clair",
    dark: "Sombre",
  },
};

export default fr;
