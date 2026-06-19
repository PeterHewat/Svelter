import { PRODUCT_NAME } from "@repo/config/product";
import type { TranslationDictionary } from "@repo/utils";

const nl: TranslationDictionary = {
  common: {
    welcome: "Welkom",
    loading: "Laden...",
    error: "Er is een fout opgetreden",
    retry: "Opnieuw proberen",
    save: "Opslaan",
    cancel: "Annuleren",
    delete: "Verwijderen",
    edit: "Bewerken",
    create: "Aanmaken",
    search: "Zoeken",
    noResults: "Geen resultaten gevonden",
  },
  theme: {
    light: "Licht",
    dark: "Donker",
    system: "Systeem",
    toggle: "Thema wisselen",
  },
  language: {
    select: "Taal selecteren",
    current: "Huidige taal: {{language}}",
  },
  nav: {
    main: "Hoofdnavigatie",
    tasks: "Taken",
    home: "Home",
    website: "Website",
  },
  auth: {
    openAuth: "Inloggen",
    login: "Inloggen",
    logout: "Uitloggen",
    signUp: "Registreren",
    email: "E-mail",
    password: "Wachtwoord",
    google: "Doorgaan met Google",
    tabsLabel: "Inloggen of registreren",
    signInTab: "Inloggen",
    signUpTab: "Registreren",
    signInTitle: "Inloggen",
    signUpTitle: "Account aanmaken",
    or: "of",
    noAccount: "Geen account?",
    hasAccount: "Heb je al een account?",
    errors: {
      invalidCredentials: "Ongeldig e-mailadres of wachtwoord.",
      accountNotFound:
        "Geen account met dit e-mailadres. Probeer je te registreren.",
      accountExists:
        "Er bestaat al een account met dit e-mailadres. Probeer in te loggen.",
      generic: "Inloggen mislukt. Probeer het opnieuw.",
      serverNotConfigured:
        "Auth is niet volledig geconfigureerd. Voer bun run setup uit voor Clerk + Convex.",
    },
  },
  home: {
    title: PRODUCT_NAME,
    subtitle: "SvelteKit + Convex + Clerk + Tailwind + Bun",
    features: {
      title: "Functies",
      svelte: "SvelteKit SPA met bestandsroutes",
      convex: "Convex voorbeeldtaken-API (inschakelen met env)",
      auth: "Clerk-inloggen (social + e-mail) met Convex-backend",
      tailwind: "Tailwind v4 met gedeelde tokens",
      i18n: "Internationalisatie (9 talen)",
      themes: "Lichte en donkere thema's",
    },
  },
  backend: {
    setupTitle: "Cloudconfiguratie afronden",
    setupBody:
      "Koppel Convex en configureer Clerk voor de taken-demo. Volg de stappen hieronder en start daarna bun run dev:convex en bun run dev:web in aparte terminals.",
    stepConvex:
      "Voer bun run setup uit om Convex te koppelen en PUBLIC_CONVEX_URL te synchroniseren",
    stepAuth:
      "Voer bun run setup uit om Clerk te configureren (publishable key + Convex issuer)",
    stepEnv: "Zie docs/getting-started.md in deze repository",
    setupGuide:
      "Volledige handleiding: docs/getting-started.md in deze repository",
    backHome: "Terug naar home",
  },
  tasks: {
    title: "Taken",
    subtitle: "Verticaal voorbeeld: Convex-mutaties en Clerk-auth",
    newPlaceholder: "Wat moet er gedaan worden?",
    add: "Taak toevoegen",
    empty: "Nog geen taken. Voeg er een toe hierboven.",
    listLabel: "Jouw taken",
    toggleComplete: "Markeer «{{title}}» als voltooid",
    delete: "Verwijder «{{title}}»",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  errors: {
    notFound: "Pagina niet gevonden",
    notFoundHint: "De opgevraagde pagina bestaat niet.",
    unauthorized: "Je bent niet gemachtigd om deze pagina te bekijken",
    serverError: "Serverfout. Probeer het later opnieuw.",
    networkError: "Netwerkfout. Controleer je verbinding.",
  },
};

export default nl;
