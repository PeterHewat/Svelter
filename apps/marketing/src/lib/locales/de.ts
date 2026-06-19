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
    github: "Auf GitHub ansehen",
  },
  home: {
    heroTitle: "Schneller entwickeln mit {{name}}",
    heroSecondaryCta: "Blog lesen",
    heroMicrocopy: "Kostenlos testen — kein Konto und keine Kreditkarte nötig",
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
    faqTitle: "Preis-FAQ",
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
    features: "Funktionen",
    pricing: "Preise",
    about: "Über uns",
    customers: "Kunden",
    blog: "Blog",
    security: "Sicherheit",
    docs: "Dokumentation",
    faq: "FAQ",
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
  },
};

export default de;
