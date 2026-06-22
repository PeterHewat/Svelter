import { PRODUCT_NAME } from "@repo/config/product";
import type { TranslationDictionary } from "@repo/utils";

const ru: TranslationDictionary = {
  common: {
    welcome: "Добро пожаловать",
    loading: "Загрузка...",
    error: "Произошла ошибка",
    retry: "Повторить",
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    edit: "Редактировать",
    create: "Создать",
    search: "Поиск",
    noResults: "Ничего не найдено",
  },
  theme: {
    light: "Светлая",
    dark: "Тёмная",
    system: "Системная",
    toggle: "Переключить тему",
    switchToLight: "Переключить на светлую тему",
    switchToDark: "Переключить на тёмную тему",
    switchToLightAria: "Переключить на светлую тему.",
    switchToDarkAria: "Переключить на тёмную тему.",
  },
  language: {
    select: "Выбрать язык",
    current: "Текущий язык: {{language}}",
  },
  nav: {
    main: "Основная навигация",
    tasks: "Задачи",
    user: "Пользователь",
    home: "Главная",
    website: "Сайт",
  },
  auth: {
    openAuth: "Войти",
    login: "Войти",
    logout: "Выйти",
    signUp: "Регистрация",
    email: "Электронная почта",
    password: "Пароль",
    google: "Продолжить с Google",
    tabsLabel: "Вход или регистрация",
    signInTab: "Войти",
    signUpTab: "Регистрация",
    signInTitle: "Войти",
    signUpTitle: "Создать аккаунт",
    or: "или",
    noAccount: "Нет аккаунта?",
    hasAccount: "Уже есть аккаунт?",
    errors: {
      invalidCredentials: "Неверный адрес электронной почты или пароль.",
      accountNotFound:
        "Аккаунт с этим адресом не найден. Попробуйте зарегистрироваться.",
      accountExists: "Аккаунт с этим адресом уже существует. Попробуйте войти.",
      generic: "Не удалось войти. Попробуйте снова.",
      serverNotConfigured:
        "Аутентификация не настроена. Запустите bun run setup для Clerk + Convex.",
    },
  },
  home: {
    title: PRODUCT_NAME,
    subtitle: "SvelteKit + Convex + Clerk + Tailwind + Bun",
    features: {
      title: "Возможности",
      svelte: "SPA на SvelteKit с файловыми маршрутами",
      convex: "Пример API задач Convex (включить через env)",
      auth: "Вход через Clerk (соцсети + почта) с бэкендом Convex",
      tailwind: "Tailwind v4 с общими токенами",
      i18n: "Интернационализация (9 языков)",
      themes: "Светлая и тёмная темы",
    },
  },
  backend: {
    setupTitle: "Завершите настройку в облаке",
    setupBody:
      "Подключите Convex и настройте Clerk для демо задач. Выполните шаги ниже, затем запустите bun run dev:convex и bun run dev:web в отдельных терминалах.",
    stepConvex:
      "Запустите bun run setup, чтобы подключить Convex и синхронизировать PUBLIC_CONVEX_URL",
    stepAuth:
      "Запустите bun run setup, чтобы настроить Clerk (публичный ключ + issuer Convex)",
    stepEnv: "См. docs/getting-started.md в этом репозитории",
    setupGuide:
      "Полное руководство: docs/getting-started.md в этом репозитории",
    backHome: "На главную",
  },
  tasks: {
    title: "Задачи",
    newPlaceholder: "Что нужно сделать?",
    add: "Добавить задачу",
    empty: "Задач пока нет. Добавьте одну выше.",
    listLabel: "Ваши задачи",
    toggleComplete: "Отметить «{{title}}» выполненной",
    delete: "Удалить «{{title}}»",
    quotaGuest: "Квота: {{count}} / {{limit}} задач (гость)",
    quotaSignedIn: "Квота: {{count}} / {{limit}} задач (вход выполнен)",
    guestLimitReached:
      "Достигнут гостевой лимит ({{limit}} задач). Создайте аккаунт, чтобы добавить больше.",
    signedInLimitReached: "Достигнут лимит задач ({{limit}} задач).",
    signUpToContinue: "Зарегистрироваться, чтобы продолжить",
    accountConvexLabel: "Профиль сохранён в Convex",
    anonymous: "Аноним",
    guestSession: "Гостевая сессия",
    noEmail: "Email не синхронизирован",
  },
  user: {
    title: "Пользователь",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  errors: {
    notFound: "Страница не найдена",
    notFoundHint: "Запрошенная страница не существует.",
    unauthorized: "У вас нет доступа к этой странице",
    serverError: "Ошибка сервера. Попробуйте позже.",
    networkError: "Ошибка сети. Проверьте подключение.",
  },
};

export default ru;
