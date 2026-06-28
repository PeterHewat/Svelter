import type { TranslationDictionary } from "@repo/utils";

const it: TranslationDictionary = {
  meta: {
    homeDescription:
      "Template monorepo pronto per la produzione per prodotto e marketing con SvelteKit, Clerk, Convex e Tailwind.",
    pricingDescription:
      "Confronta i piani Free, Pro e Business. Inizia gratis con limiti trasparenti.",
  },
  nav: {
    main: "Navigazione principale",
    menu: "Menu",
    features: "Funzionalità",
    pricing: "Prezzi",
    about: "Chi siamo",
    blog: "Blog",
    faq: "FAQ",
    docs: "Docs",
    dashboard: "Dashboard",
    signIn: "Accedi",
  },
  home: {
    heroTitle: "Sviluppa più velocemente con {{name}}",
    heroTagline:
      "Template monorepo pronto per la produzione per siti prodotto e marketing.",
    heroScreenshotAlt: "Segnaposto screenshot prodotto",
    heroMicrocopy: "Provalo gratis, senza account né carta di credito",
    customerLogosTitle: "Scelto dai team che costruiscono con il template",
    ctaTitle: "Pronto a pubblicare il tuo prodotto?",
    ctaSubtitle:
      "Clona il template, personalizza i contenuti placeholder e pubblica oggi.",
    ctaDashboard: "Vai alla dashboard",
    howItWorksTitle: "Come funziona",
    metricsTitle: "Progettato per la velocità",
    testimonialTitle: "Cosa dicono i team",
    testimonialPrev: "Testimonianza precedente",
    testimonialNext: "Testimonianza successiva",
    freeTierBadge: "Gratis per sempre",
    popularTierBadge: "Più popolare",
    faqTitle: "Domande frequenti",
    aboutTitle: "Chi siamo",
  },
  pricing: {
    subtitle: "Scegli il piano adatto al tuo team.",
    billingToggle: "Periodo di fatturazione",
    billingMonthly: "Mensile",
    billingAnnual: "Annuale",
    annualSave: "Risparmia ~17% con fatturazione annuale",
    compareTitle: "Confronta i piani",
    featureColumn: "Funzionalità",
    included: "Incluso",
    excluded: "Non incluso",
  },
  blog: {
    title: "Blog",
    back: "← Torna al blog",
    changelogVersion: "v{{version}}",
    changelogLabel: "Changelog",
  },
  docs: {
    title: "Documentazione",
    intro:
      "Guide per installazione, configurazione e deployment. Contenuto in inglese nel template.",
    back: "← Tutta la documentazione",
    sidebar: "Navigazione documentazione",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "Prodotto",
    company: "Azienda",
    resources: "Risorse",
    legal: "Legale",
    about: "Chi siamo",
    testimonials: "Testimonianze",
    security: "Sicurezza",
    privacy: "Privacy",
    terms: "Termini",
  },
  pages: {
    features: { title: "Funzionalità" },
    pricing: { title: "Prezzi" },
    legal: { title: "Legale" },
    security: { title: "Sicurezza" },
    about: { title: "Chi siamo" },
    docs: { title: "Documentazione" },
    privacy: { title: "Informativa sulla privacy" },
    terms: { title: "Termini di servizio" },
  },
  language: {
    select: "Seleziona lingua",
    hubTitle: "Scegli la tua lingua",
  },
  theme: {
    toggle: "Cambia tema",
    light: "Chiaro",
    dark: "Scuro",
    switchToLight: "Passa a tema chiaro",
    switchToDark: "Passa a tema scuro",
    switchToLightAria: "Passa a tema chiaro.",
    switchToDarkAria: "Passa a tema scuro.",
  },
};

export default it;
