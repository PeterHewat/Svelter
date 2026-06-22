import { PRODUCT_NAME } from "@repo/config/product";
import type { TranslationDictionary } from "@repo/utils";

const pl: TranslationDictionary = {
  common: {
    welcome: "Witamy",
    loading: "Ładowanie...",
    error: "Wystąpił błąd",
    retry: "Spróbuj ponownie",
    save: "Zapisz",
    cancel: "Anuluj",
    delete: "Usuń",
    edit: "Edytuj",
    create: "Utwórz",
    search: "Szukaj",
    noResults: "Nie znaleziono wyników",
  },
  theme: {
    light: "Jasny",
    dark: "Ciemny",
    system: "Systemowy",
    toggle: "Przełącz motyw",
    switchToLight: "Przełącz na jasny motyw",
    switchToDark: "Przełącz na ciemny motyw",
    switchToLightAria: "Przełącz na jasny motyw.",
    switchToDarkAria: "Przełącz na ciemny motyw.",
  },
  language: {
    select: "Wybierz język",
    current: "Bieżący język: {{language}}",
  },
  nav: {
    main: "Nawigacja główna",
    tasks: "Zadania",
    user: "Użytkownik",
    home: "Strona główna",
    website: "Strona",
  },
  auth: {
    openAuth: "Zaloguj się",
    login: "Zaloguj się",
    logout: "Wyloguj się",
    signUp: "Zarejestruj się",
    email: "E-mail",
    password: "Hasło",
    google: "Kontynuuj z Google",
    tabsLabel: "Zaloguj się lub zarejestruj",
    signInTab: "Zaloguj się",
    signUpTab: "Zarejestruj się",
    signInTitle: "Zaloguj się",
    signUpTitle: "Utwórz konto",
    or: "lub",
    noAccount: "Nie masz konta?",
    hasAccount: "Masz już konto?",
    errors: {
      invalidCredentials: "Nieprawidłowy e-mail lub hasło.",
      accountNotFound:
        "Brak konta z tym adresem e-mail. Spróbuj się zarejestrować.",
      accountExists:
        "Konto z tym adresem e-mail już istnieje. Spróbuj się zalogować.",
      generic: "Logowanie nie powiodło się. Spróbuj ponownie.",
      serverNotConfigured:
        "Uwierzytelnianie nie jest skonfigurowane. Uruchom bun run setup dla Clerk + Convex.",
    },
  },
  home: {
    title: PRODUCT_NAME,
    subtitle: "SvelteKit + Convex + Clerk + Tailwind + Bun",
    features: {
      title: "Funkcje",
      svelte: "SPA SvelteKit z trasami plikowymi",
      convex: "Przykładowe API zadań Convex (włącz przez env)",
      auth: "Logowanie Clerk (społecznościowe + e-mail) z backendem Convex",
      tailwind: "Tailwind v4 ze współdzielonymi tokenami",
      i18n: "Internacjonalizacja (9 języków)",
      themes: "Jasny i ciemny motyw",
    },
  },
  backend: {
    setupTitle: "Dokończ konfigurację w chmurze",
    setupBody:
      "Połącz Convex i skonfiguruj Clerk dla demo zadań. Wykonaj poniższe kroki, a następnie uruchom bun run dev:convex i bun run dev:web w osobnych terminalach.",
    stepConvex:
      "Uruchom bun run setup, aby połączyć Convex i zsynchronizować PUBLIC_CONVEX_URL",
    stepAuth:
      "Uruchom bun run setup, aby skonfigurować Clerk (klucz publiczny + issuer Convex)",
    stepEnv: "Zobacz docs/getting-started.md w tym repozytorium",
    setupGuide: "Pełny przewodnik: docs/getting-started.md w tym repozytorium",
    backHome: "Wróć na stronę główną",
  },
  tasks: {
    title: "Zadania",
    newPlaceholder: "Co trzeba zrobić?",
    add: "Dodaj zadanie",
    empty: "Brak zadań. Dodaj jedno powyżej.",
    listLabel: "Twoje zadania",
    toggleComplete: "Oznacz „{{title}}” jako ukończone",
    delete: "Usuń „{{title}}”",
    quotaGuest: "Limit: {{count}} / {{limit}} zadań (gość)",
    quotaSignedIn: "Limit: {{count}} / {{limit}} zadań (zalogowany)",
    guestLimitReached:
      "Limit gościa osiągnięty ({{limit}} zadań). Utwórz konto, aby dodać więcej.",
    signedInLimitReached: "Osiągnięto limit zadań ({{limit}} zadań).",
    signUpToContinue: "Zarejestruj się, aby kontynuować",
    accountConvexLabel: "Profil zapisany w Convex",
    anonymous: "Anonimowy",
    guestSession: "Sesja gościa",
    noEmail: "Brak zsynchronizowanego e-maila",
  },
  user: {
    title: "Użytkownik",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  errors: {
    notFound: "Nie znaleziono strony",
    notFoundHint: "Żądana strona nie istnieje.",
    unauthorized: "Nie masz uprawnień do wyświetlenia tej strony",
    serverError: "Błąd serwera. Spróbuj ponownie później.",
    networkError: "Błąd sieci. Sprawdź połączenie.",
  },
};

export default pl;
