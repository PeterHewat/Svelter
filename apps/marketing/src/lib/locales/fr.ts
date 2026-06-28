import type { TranslationDictionary } from "@repo/utils";

const fr: TranslationDictionary = {
  meta: {
    homeDescription:
      "Modèle monorepo prêt pour la production pour produit et marketing avec SvelteKit, Clerk, Convex et Tailwind.",
    pricingDescription:
      "Comparez les forfaits Free, Pro et Business. Commencez gratuitement avec des limites transparentes.",
  },
  nav: {
    main: "Navigation principale",
    menu: "Menu",
    features: "Fonctionnalités",
    pricing: "Tarifs",
    about: "À propos",
    blog: "Blog",
    faq: "FAQ",
    docs: "Docs",
    dashboard: "Tableau de bord",
    signIn: "Se connecter",
  },
  home: {
    heroTitle: "Développez plus vite avec {{name}}",
    heroTagline:
      "Modèle monorepo prêt pour la production pour sites produit et marketing.",
    heroScreenshotAlt: "Image de remplacement de capture produit",
    heroMicrocopy: "Essayez gratuitement, sans compte ni carte bancaire",
    customerLogosTitle:
      "Adopté par les équipes qui construisent avec le modèle",
    ctaTitle: "Prêt à lancer votre produit ?",
    ctaSubtitle:
      "Clonez le modèle, personnalisez le contenu placeholder et déployez aujourd'hui.",
    ctaDashboard: "Aller au tableau de bord",
    howItWorksTitle: "Comment ça marche",
    metricsTitle: "Conçu pour la rapidité",
    testimonialTitle: "Ce que disent les équipes",
    testimonialPrev: "Témoignage précédent",
    testimonialNext: "Témoignage suivant",
    freeTierBadge: "Gratuit pour toujours",
    popularTierBadge: "Le plus populaire",
    faqTitle: "Questions fréquentes",
    aboutTitle: "À propos",
  },
  pricing: {
    subtitle: "Choisissez le forfait adapté à votre équipe.",
    billingToggle: "Période de facturation",
    billingMonthly: "Mensuel",
    billingAnnual: "Annuel",
    annualSave: "Économisez ~17 % avec la facturation annuelle",
    compareTitle: "Comparer les forfaits",
    featureColumn: "Fonctionnalité",
    included: "Inclus",
    excluded: "Non inclus",
  },
  blog: {
    title: "Blog",
    back: "← Retour au blog",
    changelogVersion: "v{{version}}",
    changelogLabel: "Changelog",
  },
  docs: {
    title: "Documentation",
    intro:
      "Guides d'installation, de configuration et de déploiement. Contenu en anglais dans le modèle.",
    back: "← Toute la documentation",
    sidebar: "Navigation de la documentation",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "Produit",
    company: "Entreprise",
    resources: "Ressources",
    legal: "Mentions légales",
    about: "À propos",
    testimonials: "Témoignages",
    security: "Sécurité",
    privacy: "Confidentialité",
    terms: "Conditions",
  },
  pages: {
    features: { title: "Fonctionnalités" },
    pricing: { title: "Tarifs" },
    legal: { title: "Mentions légales" },
    security: { title: "Sécurité" },
    about: { title: "À propos" },
    docs: { title: "Documentation" },
    privacy: { title: "Politique de confidentialité" },
    terms: { title: "Conditions d'utilisation" },
  },
  language: {
    select: "Choisir la langue",
    hubTitle: "Choisissez votre langue",
  },
  theme: {
    toggle: "Changer de thème",
    light: "Clair",
    dark: "Sombre",
    switchToLight: "Passer au thème clair",
    switchToDark: "Passer au thème sombre",
    switchToLightAria: "Passer au thème clair.",
    switchToDarkAria: "Passer au thème sombre.",
  },
};

export default fr;
