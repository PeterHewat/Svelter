import type { TranslationDictionary } from "@repo/utils";

const ru: TranslationDictionary = {
  meta: {
    homeDescription:
      "Готовый monorepo-шаблон для продукта и маркетинга на SvelteKit, Clerk, Convex и Tailwind.",
  },
  nav: {
    main: "Основная навигация",
    blog: "Блог",
    github: "Открыть на GitHub",
  },
  home: {
    titleSuffix:
      "Monorepo SvelteKit + Convex + Clerk + Tailwind + Bun для продуктового приложения и маркетингового сайта",
    heroTitle: "Создавайте быстрее с {{name}}",
    heroSubtitle: "Готовый monorepo-шаблон для продукта и маркетинга.",
    heroCta: "Читать блог",
    featuresTitle: "Возможности",
    feature1Title: "SvelteKit везде",
    feature1Body:
      "Один фреймворк для SPA продукта и статического маркетингового сайта.",
    feature2Title: "Clerk + Convex",
    feature2Body:
      "Хостинг аутентификации с соцсетями и realtime-бэкендом Convex.",
    feature3Title: "Лёгкий деплой",
    feature3Body: "Деплой на любой CDN; Cloudflare Pages преднастроен.",
  },
  blog: {
    title: "Блог",
    back: "← Назад к блогу",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  language: {
    select: "Выберите язык",
    hubTitle: "Выберите язык",
  },
  theme: {
    toggle: "Переключить тему",
    light: "Светлая",
    dark: "Тёмная",
  },
};

export default ru;
