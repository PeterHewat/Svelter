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
    blog: "Blog",
    faq: "FAQ",
    docs: "Docs",
    dashboard: "Dashboard",
    github: "Vedi su GitHub",
  },
  home: {
    heroTitle: "Sviluppa più velocemente con {{name}}",
    heroSecondaryCta: "Leggi il blog",
    heroMicrocopy: "Provalo gratis, senza account né carta di credito",
    howItWorksTitle: "Come funziona",
    metricsTitle: "Progettato per la velocità",
    testimonialTitle: "Cosa dicono i team",
    testimonialPrev: "Testimonianza precedente",
    testimonialNext: "Testimonianza successiva",
    freeTierBadge: "Gratis per sempre",
    popularTierBadge: "Più popolare",
    faqTitle: "Domande frequenti",
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
    faqTitle: "FAQ prezzi",
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
    features: "Funzionalità",
    pricing: "Prezzi",
    about: "Chi siamo",
    customers: "Clienti",
    blog: "Blog",
    security: "Sicurezza",
    docs: "Documentazione",
    faq: "FAQ",
    github: "GitHub",
    privacy: "Privacy",
    terms: "Termini",
  },
  pages: {
    features: { title: "Funzionalità" },
    pricing: { title: "Prezzi" },
    customers: { title: "Clienti" },
    security: { title: "Sicurezza" },
    about: { title: "Chi siamo" },
    docs: { title: "Documentazione" },
    privacy: { title: "Informativa sulla privacy" },
    terms: { title: "Termini di servizio" },
  },
  stub: {
    templateNotice:
      "Placeholder del template — sostituire prima del lancio (v1).",
  },
  language: {
    select: "Seleziona lingua",
    hubTitle: "Scegli la tua lingua",
  },
  theme: {
    toggle: "Cambia tema",
    light: "Chiaro",
    dark: "Scuro",
  },
};

export default it;
