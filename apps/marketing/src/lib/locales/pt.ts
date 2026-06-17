import type { TranslationDictionary } from "@repo/utils";

const pt: TranslationDictionary = {
  meta: {
    homeDescription:
      "Modelo monorepo pronto para produção para produto e marketing com SvelteKit, Clerk, Convex e Tailwind.",
  },
  nav: {
    main: "Navegação principal",
    blog: "Blog",
    github: "Ver no GitHub",
  },
  home: {
    titleSuffix:
      "Monorepo SvelteKit + Convex + Clerk + Tailwind + Bun para app de produto e site de marketing",
    heroTitle: "Construa mais rápido com {{name}}",
    heroSubtitle:
      "Um modelo monorepo pronto para produção para produto e marketing.",
    heroCta: "Ler o blog",
    featuresTitle: "Recursos",
    feature1Title: "SvelteKit em todo lugar",
    feature1Body:
      "Um framework para sua SPA de produto e site de marketing estático.",
    feature2Title: "Clerk + Convex",
    feature2Body:
      "Autenticação hospedada com provedores sociais e backend Convex em tempo real.",
    feature3Title: "Deploy enxuto",
    feature3Body: "Deploy em qualquer CDN; Cloudflare Pages pré-configurado.",
  },
  blog: {
    title: "Blog",
    back: "← Voltar ao blog",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  language: {
    select: "Selecionar idioma",
    hubTitle: "Escolha seu idioma",
  },
  theme: {
    toggle: "Alternar tema",
    light: "Claro",
    dark: "Escuro",
  },
};

export default pt;
