import type { TranslationDictionary } from "@repo/utils";

const nl: TranslationDictionary = {
  meta: {
    homeDescription:
      "Productieklaar monorepo-sjabloon voor product en marketing met SvelteKit, Clerk, Convex en Tailwind.",
    pricingDescription:
      "Vergelijk Free-, Pro- en Business-abonnementen. Start gratis met transparante limieten.",
  },
  nav: {
    main: "Hoofdnavigatie",
    menu: "Menu",
    features: "Functies",
    pricing: "Prijzen",
    about: "Over ons",
    blog: "Blog",
    faq: "FAQ",
    docs: "Docs",
    dashboard: "Dashboard",
    signIn: "Inloggen",
  },
  home: {
    heroTitle: "Bouw sneller met {{name}}",
    heroTagline:
      "Productieklaar monorepo-sjabloon voor product- en marketingwebsites.",
    heroScreenshotAlt: "Productscreenshot-placeholder",
    heroMicrocopy: "Probeer gratis, geen account of creditcard nodig",
    customerLogosTitle: "Vertrouwd door teams die met het sjabloon bouwen",
    ctaTitle: "Klaar om je product te lanceren?",
    ctaSubtitle:
      "Kloon het sjabloon, pas de placeholder-inhoud aan en deploy vandaag.",
    ctaDashboard: "Naar dashboard",
    howItWorksTitle: "Hoe het werkt",
    metricsTitle: "Gebouwd voor snelheid",
    testimonialTitle: "Wat teams zeggen",
    testimonialPrev: "Vorige testimonial",
    testimonialNext: "Volgende testimonial",
    freeTierBadge: "Voor altijd gratis",
    popularTierBadge: "Meest populair",
    faqTitle: "Veelgestelde vragen",
    aboutTitle: "Over ons",
  },
  pricing: {
    subtitle: "Kies het abonnement dat bij uw team past.",
    billingToggle: "Factureringsperiode",
    billingMonthly: "Maandelijks",
    billingAnnual: "Jaarlijks",
    annualSave: "Bespaar ~17% met jaarlijkse facturering",
    compareTitle: "Abonnementen vergelijken",
    featureColumn: "Functie",
    included: "Inbegrepen",
    excluded: "Niet inbegrepen",
  },
  blog: {
    title: "Blog",
    back: "← Terug naar blog",
    changelogVersion: "v{{version}}",
    changelogLabel: "Changelog",
  },
  docs: {
    title: "Documentatie",
    intro:
      "Handleidingen voor lokale setup, configuratie en deployment. Inhoud in het Engels in de template.",
    back: "← Alle documentatie",
    sidebar: "Documentatienavigatie",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "Product",
    company: "Bedrijf",
    resources: "Bronnen",
    legal: "Juridisch",
    about: "Over ons",
    testimonials: "Ervaringen",
    security: "Beveiliging",
    privacy: "Privacy",
    terms: "Voorwaarden",
  },
  pages: {
    features: { title: "Functies" },
    pricing: { title: "Prijzen" },
    legal: { title: "Juridisch" },
    security: { title: "Beveiliging" },
    about: { title: "Over ons" },
    docs: { title: "Documentatie" },
    privacy: { title: "Privacybeleid" },
    terms: { title: "Servicevoorwaarden" },
  },
  language: {
    select: "Taal kiezen",
    hubTitle: "Kies uw taal",
  },
  theme: {
    toggle: "Thema wisselen",
    light: "Licht",
    dark: "Donker",
    switchToLight: "Schakel over naar licht",
    switchToDark: "Schakel over naar donker",
    switchToLightAria: "Schakel over naar licht thema.",
    switchToDarkAria: "Schakel over naar donker thema.",
  },
};

export default nl;
