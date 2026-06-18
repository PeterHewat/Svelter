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
    logIn: "Войти",
    startFree: "Начать бесплатно",
    docs: "Документация",
    github: "Открыть на GitHub",
  },
  home: {
    titleSuffix:
      "Monorepo SvelteKit + Convex + Clerk + Tailwind + Bun для продуктового приложения и маркетингового сайта",
    heroTitle: "Создавайте быстрее с {{name}}",
    heroSubtitle: "Готовый monorepo-шаблон для продукта и маркетинга.",
    heroCta: "Начать бесплатно",
    heroSecondaryCta: "Читать блог",
    heroMicrocopy: "Банковская карта не требуется",
    howItWorksTitle: "Как это работает",
    metricsTitle: "Создан для скорости",
    pricingTeaserTitle: "Простые и прозрачные тарифы",
    pricingTeaserLink: "Сравнить все планы",
    freeTierBadge: "Бесплатно навсегда",
    popularTierBadge: "Самый популярный",
    integrationsTitle: "Работает с вашим стеком",
    integrationsLink: "Смотреть интеграции",
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
    enterpriseContact: "Связаться с отделом продаж",
    faqTitle: "FAQ по тарифам",
  },
  blog: {
    title: "Блог",
    back: "← Назад к блогу",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "Продукт",
    company: "Компания",
    resources: "Ресурсы",
    legal: "Правовая информация",
    features: "Возможности",
    pricing: "Тарифы",
    integrations: "Интеграции",
    about: "О нас",
    customers: "Клиенты",
    blog: "Блог",
    security: "Безопасность",
    docs: "Документация",
    github: "GitHub",
    privacy: "Конфиденциальность",
    terms: "Условия",
  },
  pages: {
    features: { title: "Возможности" },
    pricing: { title: "Тарифы" },
    integrations: { title: "Интеграции" },
    customers: { title: "Клиенты" },
    security: { title: "Безопасность" },
    about: { title: "О нас" },
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
