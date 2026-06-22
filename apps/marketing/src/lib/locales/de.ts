import type { TranslationDictionary } from "@repo/utils";

const de: TranslationDictionary = {
  meta: {
    homeDescription:
      "Produktionsreifes Monorepo-Template für Produkt und Marketing mit SvelteKit, Clerk, Convex und Tailwind.",
    pricingDescription:
      "Vergleichen Sie Free-, Pro- und Business-Tarife. Starten Sie kostenlos mit transparenten Limits.",
    blogDescription:
      "Produktupdates, Changelog-Releases und Artikel von der Marketing-Website.",
    docsDescription:
      "Dokumentation zur Installation, Konfiguration und zum Deployment der Vorlage.",
  },
  nav: {
    main: "Hauptnavigation",
    menu: "Menü",
    features: "Funktionen",
    pricing: "Preise",
    blog: "Blog",
    faq: "FAQ",
    docs: "Docs",
    dashboard: "Dashboard",
    signIn: "Anmelden",
    github: "Auf GitHub ansehen",
  },
  home: {
    heroTitle: "Schneller entwickeln mit {{name}}",
    heroTagline:
      "Produktionsreifes Monorepo-Template für Produkt- und Marketing-Websites.",
    heroScreenshotAlt: "Platzhalter für Produkt-Screenshot",
    heroMicrocopy: "Kostenlos testen — kein Konto und keine Kreditkarte nötig",
    logoBarTagline: "Vertraut von Teams, die mit der Vorlage bauen",
    ctaTitle: "Bereit, Ihr Produkt zu veröffentlichen?",
    ctaSubtitle:
      "Klonen Sie die Vorlage, passen Sie die Platzhalterinhalte an und deployen Sie noch heute.",
    ctaDashboard: "Zum Dashboard",
    howItWorksTitle: "So funktioniert es",
    metricsTitle: "Für Geschwindigkeit gebaut",
    testimonialTitle: "Das sagen Teams",
    testimonialPrev: "Vorheriges Testimonial",
    testimonialNext: "Nächstes Testimonial",
    freeTierBadge: "Für immer kostenlos",
    popularTierBadge: "Am beliebtesten",
    faqTitle: "Häufig gestellte Fragen",
  },
  pricing: {
    subtitle: "Wählen Sie den passenden Plan für Ihr Team.",
    billingToggle: "Abrechnungszeitraum",
    billingMonthly: "Monatlich",
    billingAnnual: "Jährlich",
    annualSave: "~17 % sparen bei jährlicher Abrechnung",
    compareTitle: "Pläne vergleichen",
    featureColumn: "Funktion",
    included: "Enthalten",
    excluded: "Nicht enthalten",
  },
  blog: {
    title: "Blog",
    back: "← Zurück zum Blog",
    changelogVersion: "v{{version}}",
    changelogLabel: "Changelog",
  },
  docs: {
    title: "Dokumentation",
    intro:
      "Anleitungen für lokale Einrichtung, Konfiguration und Deployment. Inhalt in der Vorlage nur auf Englisch.",
    back: "← Alle Dokumente",
    sidebar: "Dokumentationsnavigation",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "Produkt",
    company: "Unternehmen",
    resources: "Ressourcen",
    legal: "Rechtliches",
    about: "Über uns",
    customers: "Kunden",
    security: "Sicherheit",
    github: "GitHub",
    privacy: "Datenschutz",
    terms: "AGB",
  },
  pages: {
    features: { title: "Funktionen" },
    pricing: { title: "Preise" },
    customers: { title: "Kunden" },
    security: { title: "Sicherheit" },
    about: { title: "Über uns" },
    docs: { title: "Dokumentation" },
    privacy: { title: "Datenschutzerklärung" },
    terms: { title: "Nutzungsbedingungen" },
  },
  stub: {
    templateNotice: "Template-Platzhalter — vor dem Start ersetzen (v1).",
  },
  language: {
    select: "Sprache wählen",
    hubTitle: "Wählen Sie Ihre Sprache",
  },
  theme: {
    toggle: "Theme wechseln",
    light: "Hell",
    dark: "Dunkel",
    switchToLight: "Zu Hell wechseln",
    switchToDark: "Zu Dunkel wechseln",
    switchToLightAria: "Zu hellem Theme wechseln.",
    switchToDarkAria: "Zu dunklem Theme wechseln.",
  },
};

export default de;
