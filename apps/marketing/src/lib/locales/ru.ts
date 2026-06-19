import type { TranslationDictionary } from "@repo/utils";

const ru: TranslationDictionary = {
  meta: {
    homeDescription:
      "Готовый monorepo-шаблон для продукта и маркетинга на SvelteKit, Clerk, Convex и Tailwind.",
    pricingDescription:
      "Сравните тарифы Free, Pro и Business. Начните бесплатно с прозрачными лимитами.",
  },
  nav: {
    main: "Основная навигация",
    menu: "Меню",
    features: "Возможности",
    pricing: "Тарифы",
    blog: "Блог",
    faq: "FAQ",
    docs: "Доки",
    dashboard: "Панель",
    github: "Открыть на GitHub",
  },
  home: {
    heroTitle: "Создавайте быстрее с {{name}}",
    heroTagline:
      "Готовый monorepo-шаблон для продуктовых и маркетинговых сайтов.",
    heroScreenshotAlt: "Заглушка скриншота продукта",
    heroMicrocopy: "Попробуйте бесплатно — без аккаунта и банковской карты",
    logoBarTagline: "Нам доверяют команды, создающие на шаблоне",
    ctaTitle: "Готовы запустить продукт?",
    ctaSubtitle:
      "Клонируйте шаблон, настройте заглушки контента и разверните сегодня.",
    howItWorksTitle: "Как это работает",
    metricsTitle: "Создан для скорости",
    testimonialTitle: "Что говорят команды",
    testimonialPrev: "Предыдущий отзыв",
    testimonialNext: "Следующий отзыв",
    freeTierBadge: "Бесплатно навсегда",
    popularTierBadge: "Самый популярный",
    faqTitle: "Часто задаваемые вопросы",
  },
  pricing: {
    subtitle: "Выберите план для вашей команды.",
    billingToggle: "Период оплаты",
    billingMonthly: "Ежемесячно",
    billingAnnual: "Ежегодно",
    annualSave: "Экономия ~17% при годовой оплате",
    compareTitle: "Сравнение тарифов",
    featureColumn: "Функция",
    included: "Включено",
    excluded: "Не включено",
  },
  blog: {
    title: "Блог",
    back: "← Назад к блогу",
    changelogVersion: "v{{version}}",
    changelogLabel: "Changelog",
  },
  docs: {
    title: "Документация",
    intro:
      "Руководства по установке, настройке и развёртыванию. В шаблоне контент на английском.",
    back: "← Вся документация",
    sidebar: "Навигация по документации",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "Продукт",
    company: "Компания",
    resources: "Ресурсы",
    legal: "Правовая информация",
    about: "О нас",
    customers: "Клиенты",
    security: "Безопасность",
    github: "GitHub",
    privacy: "Конфиденциальность",
    terms: "Условия",
  },
  pages: {
    features: { title: "Возможности" },
    pricing: { title: "Тарифы" },
    customers: { title: "Клиенты" },
    security: { title: "Безопасность" },
    about: { title: "О нас" },
    docs: { title: "Документация" },
    privacy: { title: "Политика конфиденциальности" },
    terms: { title: "Условия использования" },
  },
  stub: {
    templateNotice: "Заглушка шаблона — заменить перед запуском (v1).",
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
