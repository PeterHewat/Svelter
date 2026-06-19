import { PRODUCT_NAME } from "@repo/config/product";
import type { TranslationDictionary } from "@repo/utils";

/**
 * English translations — canonical source of truth for all translation keys.
 */
const en = {
  common: {
    welcome: "Welcome",
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    noResults: "No results found",
  },
  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
    toggle: "Toggle theme",
  },
  language: {
    select: "Select language",
    current: "Current language: {{language}}",
  },
  nav: {
    main: "Main navigation",
    tasks: "Tasks",
    home: "Home",
    website: "Website",
  },
  auth: {
    openAuth: "Sign in",
    login: "Sign in",
    logout: "Log out",
    signUp: "Sign up",
    email: "Email",
    password: "Password",
    google: "Continue with Google",
    tabsLabel: "Sign in or sign up",
    signInTab: "Sign in",
    signUpTab: "Sign up",
    signInTitle: "Sign in",
    signUpTitle: "Create account",
    or: "or",
    noAccount: "No account?",
    hasAccount: "Already have an account?",
    errors: {
      invalidCredentials: "Invalid email or password.",
      accountNotFound:
        "No account found with this email. Try signing up instead.",
      accountExists:
        "An account with this email already exists. Try signing in instead.",
      generic: "Sign in failed. Please try again.",
      serverNotConfigured:
        "Auth is not fully configured. Run bun run setup for Clerk + Convex env vars.",
    },
  },
  home: {
    title: PRODUCT_NAME,
    subtitle: "SvelteKit + Convex + Clerk + Tailwind + Bun",
    features: {
      title: "Features",
      svelte: "SvelteKit SPA with file routes",
      convex: "Convex sample tasks API (enable with env)",
      auth: "Clerk sign-in (social + email) with Convex backend",
      tailwind: "Tailwind v4 with shared tokens",
      i18n: "Internationalization (9 languages)",
      themes: "Light and dark themes",
    },
  },
  backend: {
    setupTitle: "Finish cloud setup",
    setupBody:
      "Link Convex and configure Clerk to run the tasks demo. Follow the steps below, then start bun run dev:convex and bun run dev:web in separate terminals.",
    stepConvex: "Run bun run setup to link Convex and sync PUBLIC_CONVEX_URL",
    stepAuth:
      "Run bun run setup to configure Clerk (publishable key + Convex issuer)",
    stepEnv: "See docs/getting-started.md in this repository",
    setupGuide: "Full walkthrough: docs/getting-started.md in this repository",
    backHome: "Back to home",
  },
  tasks: {
    title: "Tasks",
    subtitle: "Sample vertical slice: Convex mutations and Clerk auth",
    newPlaceholder: "What needs to be done?",
    add: "Add task",
    empty: "No tasks yet. Add one above.",
    listLabel: "Your tasks",
    toggleComplete: "Mark “{{title}}” complete",
    delete: "Delete “{{title}}”",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  errors: {
    notFound: "Page not found",
    notFoundHint: "The page you requested does not exist.",
    unauthorized: "You are not authorized to view this page",
    serverError: "Server error. Please try again later.",
    networkError: "Network error. Please check your connection.",
  },
} as const satisfies TranslationDictionary;

export default en;
