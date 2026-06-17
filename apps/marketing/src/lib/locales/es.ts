import type { TranslationDictionary } from "@repo/utils";

const es: TranslationDictionary = {
  meta: {
    homeDescription:
      "Plantilla monorepo lista para producción para producto y marketing con SvelteKit, Clerk, Convex y Tailwind.",
  },
  nav: {
    main: "Navegación principal",
    blog: "Blog",
    github: "Ver en GitHub",
  },
  home: {
    titleSuffix:
      "Monorepo SvelteKit + Convex + Clerk + Tailwind + Bun para tu app de producto y sitio de marketing",
    heroTitle: "Construye más rápido con {{name}}",
    heroSubtitle:
      "Una plantilla monorepo lista para producción para producto y marketing.",
    heroCta: "Leer el blog",
    featuresTitle: "Características",
    feature1Title: "SvelteKit en todas partes",
    feature1Body:
      "Un solo framework para tu SPA de producto y sitio de marketing estático.",
    feature2Title: "Clerk + Convex",
    feature2Body:
      "Autenticación alojada con proveedores sociales y backend Convex en tiempo real.",
    feature3Title: "Despliegue ligero",
    feature3Body:
      "Despliegue en cualquier CDN; Cloudflare Pages preconfigurado.",
  },
  blog: {
    title: "Blog",
    back: "← Volver al blog",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  language: {
    select: "Seleccionar idioma",
    hubTitle: "Elige tu idioma",
  },
  theme: {
    toggle: "Cambiar tema",
    light: "Claro",
    dark: "Oscuro",
  },
};

export default es;
