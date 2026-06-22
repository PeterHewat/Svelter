import { PRODUCT_NAME } from "@repo/config/product";
import type { TranslationDictionary } from "@repo/utils";

const fr: TranslationDictionary = {
  common: {
    welcome: "Bienvenue",
    loading: "Chargement...",
    error: "Une erreur s'est produite",
    retry: "Réessayer",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    search: "Rechercher",
    noResults: "Aucun résultat trouvé",
  },
  theme: {
    light: "Clair",
    dark: "Sombre",
    system: "Système",
    toggle: "Changer le thème",
    switchToLight: "Passer au thème clair",
    switchToDark: "Passer au thème sombre",
    switchToLightAria: "Passer au thème clair.",
    switchToDarkAria: "Passer au thème sombre.",
  },
  language: {
    select: "Choisir la langue",
    current: "Langue actuelle : {{language}}",
  },
  nav: {
    main: "Navigation principale",
    tasks: "Tâches",
    user: "Utilisateur",
    home: "Accueil",
    website: "Site web",
  },
  auth: {
    openAuth: "Se connecter",
    login: "Se connecter",
    logout: "Se déconnecter",
    signUp: "S'inscrire",
    email: "E-mail",
    password: "Mot de passe",
    google: "Continuer avec Google",
    tabsLabel: "Connexion ou inscription",
    signInTab: "Se connecter",
    signUpTab: "S'inscrire",
    signInTitle: "Connexion",
    signUpTitle: "Créer un compte",
    or: "ou",
    noAccount: "Pas de compte ?",
    hasAccount: "Déjà un compte ?",
    errors: {
      invalidCredentials: "E-mail ou mot de passe incorrect.",
      accountNotFound:
        "Aucun compte avec cet e-mail. Essayez de vous inscrire.",
      accountExists:
        "Un compte avec cet e-mail existe déjà. Essayez de vous connecter.",
      generic: "Échec de la connexion. Veuillez réessayer.",
      serverNotConfigured:
        "Auth n'est pas entièrement configuré. Lancez bun run setup pour Clerk + Convex.",
    },
  },
  home: {
    title: PRODUCT_NAME,
    subtitle: "SvelteKit + Convex + Clerk + Tailwind + Bun",
    features: {
      title: "Fonctionnalités",
      svelte: "SPA SvelteKit avec routes fichier",
      convex: "API tâches exemple Convex (activer via env)",
      auth: "Connexion Clerk (social + e-mail) avec backend Convex",
      tailwind: "Tailwind v4 avec jetons partagés",
      i18n: "Internationalisation (9 langues)",
      themes: "Thèmes clair et sombre",
    },
  },
  backend: {
    setupTitle: "Terminer la configuration cloud",
    setupBody:
      "Liez Convex et configurez Clerk pour la démo tâches. Suivez les étapes puis lancez bun run dev:convex et bun run dev:web dans des terminaux séparés.",
    stepConvex:
      "Lancez bun run setup pour lier Convex et synchroniser PUBLIC_CONVEX_URL",
    stepAuth:
      "Lancez bun run setup pour configurer Clerk (clé publique + issuer Convex)",
    stepEnv: "Voir docs/getting-started.md dans ce dépôt",
    setupGuide: "Guide complet : docs/getting-started.md dans ce dépôt",
    backHome: "Retour à l'accueil",
  },
  tasks: {
    title: "Tâches",
    newPlaceholder: "Que faut-il faire ?",
    add: "Ajouter une tâche",
    empty: "Pas encore de tâches. Ajoutez-en une ci-dessus.",
    listLabel: "Vos tâches",
    toggleComplete: "Marquer « {{title}} » comme terminée",
    delete: "Supprimer « {{title}} »",
    quotaGuest: "Quota : {{count}} / {{limit}} tâches (invité)",
    quotaSignedIn: "Quota : {{count}} / {{limit}} tâches (connecté)",
    guestLimitReached:
      "Limite invité atteinte ({{limit}} tâches). Créez un compte pour en ajouter.",
    signedInLimitReached: "Limite de tâches atteinte ({{limit}} tâches).",
    signUpToContinue: "S'inscrire pour continuer",
    accountConvexLabel: "Profil stocké dans Convex",
    anonymous: "Anonyme",
    guestSession: "Session invité",
    noEmail: "Aucun e-mail synchronisé",
  },
  user: {
    title: "Utilisateur",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
  },
  errors: {
    notFound: "Page introuvable",
    notFoundHint: "La page demandée n'existe pas.",
    unauthorized: "Vous n'êtes pas autorisé à voir cette page",
    serverError: "Erreur serveur. Veuillez réessayer plus tard.",
    networkError: "Erreur réseau. Vérifiez votre connexion.",
  },
};

export default fr;
