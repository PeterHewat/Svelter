import type { TranslationDictionary } from "@repo/utils";

const pl: TranslationDictionary = {
  meta: {
    homeDescription:
      "Gotowy szablon monorepo do produktu i marketingu z SvelteKit, Clerk, Convex i Tailwind.",
    pricingDescription:
      "Porównaj plany Free, Pro i Business. Zacznij za darmo z przejrzystymi limitami.",
  },
  nav: {
    main: "Nawigacja główna",
    menu: "Menu",
    features: "Funkcje",
    pricing: "Cennik",
    blog: "Blog",
    logIn: "Zaloguj się",
    startFree: "Zacznij za darmo",
    docs: "Dokumentacja",
    github: "Zobacz na GitHubie",
  },
  home: {
    titleSuffix:
      "Monorepo SvelteKit + Convex + Clerk + Tailwind + Bun dla aplikacji produktowej i strony marketingowej",
    heroTitle: "Buduj szybciej z {{name}}",
    heroSubtitle: "Gotowy szablon monorepo do produktu i marketingu.",
    heroCta: "Zacznij za darmo",
    heroSecondaryCta: "Czytaj blog",
    heroMicrocopy: "Karta kredytowa nie jest wymagana",
    howItWorksTitle: "Jak to działa",
    metricsTitle: "Zbudowany dla szybkości",
    pricingTeaserTitle: "Proste, przejrzyste ceny",
    pricingTeaserLink: "Porównaj wszystkie plany",
    freeTierBadge: "Darmowy na zawsze",
    popularTierBadge: "Najpopularniejszy",
    integrationsTitle: "Działa z Twoim stackiem",
    integrationsLink: "Zobacz integracje",
    faqTitle: "Często zadawane pytania",
  },
  pricing: {
    subtitle: "Wybierz plan dopasowany do zespołu.",
    billingToggle: "Okres rozliczeniowy",
    billingMonthly: "Miesięcznie",
    billingAnnual: "Rocznie",
    annualSave: "Oszczędź ~17% przy rozliczeniu rocznym",
    compareTitle: "Porównaj plany",
    featureColumn: "Funkcja",
    included: "W cenie",
    excluded: "Niedostępne",
    enterpriseContact: "Kontakt ze sprzedażą",
    faqTitle: "FAQ cenowe",
  },
  blog: {
    title: "Blog",
    back: "← Wróć do bloga",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "Produkt",
    company: "Firma",
    resources: "Zasoby",
    legal: "Prawne",
    features: "Funkcje",
    pricing: "Cennik",
    integrations: "Integracje",
    about: "O nas",
    customers: "Klienci",
    blog: "Blog",
    security: "Bezpieczeństwo",
    docs: "Dokumentacja",
    github: "GitHub",
    privacy: "Prywatność",
    terms: "Regulamin",
  },
  pages: {
    features: { title: "Funkcje" },
    pricing: { title: "Cennik" },
    integrations: { title: "Integracje" },
    customers: { title: "Klienci" },
    security: { title: "Bezpieczeństwo" },
    about: { title: "O nas" },
    privacy: { title: "Polityka prywatności" },
    terms: { title: "Regulamin usługi" },
  },
  stub: {
    templateNotice: "Placeholder szablonu — zastąpić przed uruchomieniem (v1).",
  },
  language: {
    select: "Wybierz język",
    hubTitle: "Wybierz język",
  },
  theme: {
    toggle: "Przełącz motyw",
    light: "Jasny",
    dark: "Ciemny",
  },
};

export default pl;
