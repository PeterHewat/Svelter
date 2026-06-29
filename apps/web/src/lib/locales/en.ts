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
    switchToLight: "Switch to Light",
    switchToDark: "Switch to Dark",
    switchToLightAria: "Switch to Light theme.",
    switchToDarkAria: "Switch to Dark theme.",
  },
  language: {
    select: "Select language",
    current: "Current language: {{language}}",
  },
  nav: {
    main: "Main navigation",
    tasks: "Tasks",
    user: "User",
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
    introBeforeSetup: "This is the product web app. After completing ",
    introAfterSetup:
      ", Convex and Clerk should be connected. Use it as a starting example, then replace this demo with your own project.",
    tasksNote:
      " lets you verify the backend is wired correctly. Works without sign-in (3-task guest limit). Sign in to merge guest tasks into your account.",
    userNote: " shows your Convex profile.",
    marketingLink: "Go back to the marketing website",
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
    newPlaceholder: "What needs to be done?",
    add: "Add task",
    empty: "No tasks yet. Add one above.",
    listLabel: "Your tasks",
    toggleComplete: "Mark “{{title}}” complete",
    delete: "Delete “{{title}}”",
    quotaGuest: "Quota: {{count}} / {{limit}} tasks (guest)",
    quotaSignedIn: "Quota: {{count}} / {{limit}} tasks (signed in)",
    guestLimitReached:
      "Guest limit reached ({{limit}} tasks). Create an account to add more.",
    signedInLimitReached: "Task limit reached ({{limit}} tasks).",
    signUpToContinue: "Sign up to continue",
    accountConvexLabel: "Profile stored in Convex",
    anonymous: "Anonymous",
    guestSession: "Guest session",
    noEmail: "No email synced",
  },
  user: {
    title: "User",
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
