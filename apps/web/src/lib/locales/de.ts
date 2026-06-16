import { PRODUCT_NAME } from "@repo/config/product";
import type { TranslationDictionary } from "@repo/utils";

const de: TranslationDictionary = {
  common: {
    welcome: "Willkommen",
    loading: "Laden...",
    error: "Ein Fehler ist aufgetreten",
    retry: "Erneut versuchen",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    create: "Erstellen",
    search: "Suchen",
    noResults: "Keine Ergebnisse gefunden",
  },
  theme: {
    light: "Hell",
    dark: "Dunkel",
    system: "System",
    toggle: "Thema wechseln",
  },
  language: {
    select: "Sprache auswählen",
    current: "Aktuelle Sprache: {{language}}",
  },
  nav: {
    main: "Hauptnavigation",
    tasks: "Aufgaben",
    home: "Startseite",
  },
  auth: {
    openAuth: "Anmelden",
    login: "Anmelden",
    logout: "Abmelden",
    signUp: "Registrieren",
    email: "E-Mail",
    password: "Passwort",
    google: "Mit Google fortfahren",
    tabsLabel: "Anmelden oder registrieren",
    signInTab: "Anmelden",
    signUpTab: "Registrieren",
    signInTitle: "Anmelden",
    signUpTitle: "Konto erstellen",
    or: "oder",
    noAccount: "Noch kein Konto?",
    hasAccount: "Bereits ein Konto?",
    errors: {
      invalidCredentials: "Ungültige E-Mail oder Passwort.",
      accountNotFound:
        "Kein Konto mit dieser E-Mail. Versuchen Sie die Registrierung.",
      accountExists:
        "Ein Konto mit dieser E-Mail existiert bereits. Versuchen Sie die Anmeldung.",
      generic: "Anmeldung fehlgeschlagen. Bitte erneut versuchen.",
      serverNotConfigured:
        "Auth ist nicht vollständig konfiguriert. Führen Sie bun run setup für Clerk + Convex aus.",
    },
  },
  home: {
    title: PRODUCT_NAME,
    subtitle: "SvelteKit + Convex + Clerk + Tailwind + Bun",
    features: {
      title: "Funktionen",
      svelte: "SvelteKit-SPA mit Dateirouten",
      convex: "Convex Beispiel-Aufgaben-API (per Env aktivieren)",
      auth: "Clerk-Anmeldung (Social + E-Mail) mit Convex-Backend",
      tailwind: "Tailwind v4 mit gemeinsamen Tokens",
      i18n: "Internationalisierung (9 Sprachen)",
      themes: "Helle und dunkle Themen",
    },
  },
  backend: {
    setupTitle: "Cloud-Setup abschließen",
    setupBody:
      "Convex verknüpfen und Clerk für die Aufgaben-Demo einrichten. Schritte unten, dann bun run dev:convex und bun run dev:web in getrennten Terminals starten.",
    stepConvex:
      "bun run setup ausführen — verknüpft Convex und synchronisiert PUBLIC_CONVEX_URL",
    stepAuth:
      "bun run setup ausführen — Clerk (Publishable Key + Convex Issuer)",
    stepEnv: "Siehe docs/getting-started.md in diesem Repository",
    setupGuide:
      "Vollständige Anleitung: docs/getting-started.md in diesem Repository",
    backHome: "Zur Startseite",
  },
  tasks: {
    title: "Aufgaben",
    subtitle: "Vertikaler Schnitt: Convex-Mutationen und Clerk-Auth",
    newPlaceholder: "Was ist zu erledigen?",
    add: "Aufgabe hinzufügen",
    empty: "Noch keine Aufgaben. Oben eine hinzufügen.",
    listLabel: "Ihre Aufgaben",
    toggleComplete: "„{{title}}“ als erledigt markieren",
    delete: "„{{title}}“ löschen",
  },
  errors: {
    notFound: "Seite nicht gefunden",
    notFoundHint: "Die angeforderte Seite existiert nicht.",
    unauthorized: "Sie sind nicht berechtigt, diese Seite anzuzeigen",
    serverError: "Serverfehler. Bitte versuchen Sie es später erneut.",
    networkError: "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.",
  },
};

export default de;
