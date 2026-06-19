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
    faq: "FAQ",
    docs: "Docs",
    dashboard: "Panel",
    github: "Zobacz na GitHubie",
  },
  home: {
    heroTitle: "Buduj szybciej z {{name}}",
    heroSecondaryCta: "Czytaj blog",
    heroMicrocopy: "Wypróbuj za darmo — bez konta i karty kredytowej",
    howItWorksTitle: "Jak to działa",
    metricsTitle: "Zbudowany dla szybkości",
    testimonialTitle: "Co mówią zespoły",
    testimonialPrev: "Poprzednia opinia",
    testimonialNext: "Następna opinia",
    freeTierBadge: "Darmowy na zawsze",
    popularTierBadge: "Najpopularniejszy",
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
    faqTitle: "FAQ cenowe",
  },
  blog: {
    title: "Blog",
    back: "← Wróć do bloga",
    changelogVersion: "v{{version}}",
    changelogLabel: "Changelog",
  },
  docs: {
    title: "Dokumentacja",
    intro:
      "Przewodniki instalacji, konfiguracji i wdrożenia. Treść po angielsku w szablonie.",
    back: "← Cała dokumentacja",
    sidebar: "Nawigacja dokumentacji",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "Produkt",
    company: "Firma",
    resources: "Zasoby",
    legal: "Prawne",
    features: "Funkcje",
    pricing: "Cennik",
    about: "O nas",
    customers: "Klienci",
    blog: "Blog",
    security: "Bezpieczeństwo",
    docs: "Dokumentacja",
    faq: "FAQ",
    github: "GitHub",
    privacy: "Prywatność",
    terms: "Regulamin",
  },
  pages: {
    features: { title: "Funkcje" },
    pricing: { title: "Cennik" },
    customers: { title: "Klienci" },
    security: { title: "Bezpieczeństwo" },
    about: { title: "O nas" },
    docs: { title: "Dokumentacja" },
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
