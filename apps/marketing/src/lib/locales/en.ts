import type { TranslationDictionary } from "@repo/utils";

/** English marketing copy — canonical key set for locale parity. */
const en = {
  meta: {
    homeDescription:
      "A production-ready monorepo template for product and marketing with SvelteKit, Clerk, Convex, and Tailwind.",
    pricingDescription:
      "Compare Free, Pro, and Business plans. Start free with transparent template limits.",
    blogDescription:
      "Product updates, changelog releases, and template articles from the marketing site.",
    featuresDescription:
      "Template feature overview and example deep-dive routes — replace with your product areas in v1.",
    integrationsDescription:
      "Placeholder integrations page for partner logos and connectors.",
    customersDescription:
      "Customer stories stub — add real logos and case studies in v1.",
    securityDescription:
      "Security overview stub with example subprocessors table.",
    aboutDescription: "About page stub for your company story.",
    privacyDescription:
      "Placeholder privacy policy — replace with counsel-reviewed text before launch.",
    termsDescription:
      "Placeholder terms of service — replace with counsel-reviewed text before launch.",
  },
  nav: {
    main: "Main navigation",
    menu: "Menu",
    features: "Features",
    pricing: "Pricing",
    blog: "Blog",
    logIn: "Log in",
    startFree: "Start free",
    docs: "Docs",
    github: "View on GitHub",
  },
  home: {
    titleSuffix:
      "SvelteKit + Convex + Clerk + Tailwind + Bun monorepo starter for your product app and marketing site",
    heroTitle: "Build faster with {{name}}",
    heroSubtitle:
      "A production-ready monorepo template for product and marketing.",
    heroCta: "Start free",
    heroSecondaryCta: "Read the blog",
    heroMicrocopy: "No credit card required",
    howItWorksTitle: "How it works",
    metricsTitle: "Built for speed",
    pricingTeaserTitle: "Simple, transparent pricing",
    pricingTeaserLink: "Compare all plans",
    freeTierBadge: "Free forever",
    popularTierBadge: "Most popular",
    integrationsTitle: "Works with your stack",
    integrationsLink: "View integrations",
    faqTitle: "Frequently asked questions",
  },
  pricing: {
    subtitle: "Choose the plan that fits your team.",
    billingToggle: "Billing period",
    billingMonthly: "Monthly",
    billingAnnual: "Annual",
    annualSave: "Save ~17% with annual billing",
    compareTitle: "Compare plans",
    featureColumn: "Feature",
    included: "Included",
    excluded: "Not included",
    enterpriseContact: "Contact sales",
    faqTitle: "Pricing FAQ",
  },
  blog: {
    title: "Blog",
    back: "← Back to blog",
    filterLabel: "Filter posts",
    filterAll: "All",
    filterArticles: "Articles",
    filterChangelog: "Changelog",
    changelogVersion: "v{{version}}",
    empty: "No posts in this category yet.",
  },
  features: {
    deepDivesTitle: "Feature deep-dives",
    backToOverview: "← All features",
  },
  security: {
    subprocessorsTitle: "Example subprocessors",
    subprocessorName: "Vendor",
    subprocessorPurpose: "Purpose",
    subprocessorLocation: "Location",
  },
  footer: {
    copyright: "© {{year}} {{name}}",
    product: "Product",
    company: "Company",
    resources: "Resources",
    legal: "Legal",
    features: "Features",
    pricing: "Pricing",
    integrations: "Integrations",
    about: "About",
    customers: "Customers",
    blog: "Blog",
    security: "Security",
    docs: "Documentation",
    github: "GitHub",
    privacy: "Privacy",
    terms: "Terms",
  },
  pages: {
    features: { title: "Features" },
    pricing: { title: "Pricing" },
    integrations: { title: "Integrations" },
    customers: { title: "Customers" },
    security: { title: "Security" },
    about: { title: "About" },
    privacy: { title: "Privacy Policy" },
    terms: { title: "Terms of Service" },
  },
  stub: {
    templateNotice: "Template placeholder — replace before launch (v1).",
  },
  language: {
    select: "Select language",
    hubTitle: "Choose your language",
  },
  theme: {
    toggle: "Toggle theme",
    light: "Light",
    dark: "Dark",
  },
} as const satisfies TranslationDictionary;

export default en;
