import { PRODUCT_NAME } from "@repo/config/product";
import type { TranslationDictionary } from "@repo/utils";

const it: TranslationDictionary = {
  common: {
    welcome: "Benvenuto",
    loading: "Caricamento...",
    error: "Si è verificato un errore",
    retry: "Riprova",
    save: "Salva",
    cancel: "Annulla",
    delete: "Elimina",
    edit: "Modifica",
    create: "Crea",
    search: "Cerca",
    noResults: "Nessun risultato trovato",
  },
  theme: {
    light: "Chiaro",
    dark: "Scuro",
    system: "Sistema",
    toggle: "Cambia tema",
  },
  language: {
    select: "Seleziona lingua",
    current: "Lingua attuale: {{language}}",
  },
  nav: {
    main: "Navigazione principale",
    tasks: "Attività",
    home: "Home",
    website: "Sito web",
  },
  auth: {
    openAuth: "Accedi",
    login: "Accedi",
    logout: "Esci",
    signUp: "Registrati",
    email: "Email",
    password: "Password",
    google: "Continua con Google",
    tabsLabel: "Accedi o registrati",
    signInTab: "Accedi",
    signUpTab: "Registrati",
    signInTitle: "Accedi",
    signUpTitle: "Crea account",
    or: "oppure",
    noAccount: "Non hai un account?",
    hasAccount: "Hai già un account?",
    errors: {
      invalidCredentials: "Email o password non validi.",
      accountNotFound: "Nessun account con questa email. Prova a registrarti.",
      accountExists:
        "Esiste già un account con questa email. Prova ad accedere.",
      generic: "Accesso non riuscito. Riprova.",
      serverNotConfigured:
        "L'autenticazione non è configurata. Esegui bun run setup per Clerk + Convex.",
    },
  },
  home: {
    title: PRODUCT_NAME,
    subtitle: "SvelteKit + Convex + Clerk + Tailwind + Bun",
    features: {
      title: "Funzionalità",
      svelte: "SPA SvelteKit con route basate su file",
      convex: "API attività di esempio con Convex (attiva con env)",
      auth: "Accesso con Clerk (social + email) e backend Convex",
      tailwind: "Tailwind v4 con token condivisi",
      i18n: "Internazionalizzazione (9 lingue)",
      themes: "Temi chiaro e scuro",
    },
  },
  backend: {
    setupTitle: "Completa la configurazione cloud",
    setupBody:
      "Collega Convex e configura Clerk per la demo delle attività. Segui i passaggi qui sotto, poi avvia bun run dev:convex e bun run dev:web in terminali separati.",
    stepConvex:
      "Esegui bun run setup per collegare Convex e sincronizzare PUBLIC_CONVEX_URL",
    stepAuth:
      "Esegui bun run setup per configurare Clerk (chiave pubblica + issuer Convex)",
    stepEnv: "Vedi docs/getting-started.md in questo repository",
    setupGuide: "Guida completa: docs/getting-started.md in questo repository",
    backHome: "Torna alla home",
  },
  tasks: {
    title: "Attività",
    subtitle: "Esempio verticale: mutazioni Convex e auth Clerk",
    newPlaceholder: "Cosa c'è da fare?",
    add: "Aggiungi attività",
    empty: "Nessuna attività. Aggiungine una sopra.",
    listLabel: "Le tue attività",
    toggleComplete: "Segna «{{title}}» come completata",
    delete: "Elimina «{{title}}»",
    guestLimit: "{{count}} / {{limit}} attività ospite",
    guestLimitReached:
      "Limite ospite raggiunto ({{limit}} attività). Crea un account per aggiungerne.",
    signUpToContinue: "Registrati per continuare",
    accountConvexLabel: "Profilo salvato in Convex",
    anonymous: "Anonimo",
    guestSession: "Sessione ospite",
    noEmail: "Nessuna email sincronizzata",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  errors: {
    notFound: "Pagina non trovata",
    notFoundHint: "La pagina richiesta non esiste.",
    unauthorized: "Non sei autorizzato a visualizzare questa pagina",
    serverError: "Errore del server. Riprova più tardi.",
    networkError: "Errore di rete. Controlla la connessione.",
  },
};

export default it;
