import type { TranslationDictionary } from "@repo/utils";

/** English marketing copy — canonical key set for locale parity. */
const en = {
  meta: {
    homeDescription:
      "A production-ready monorepo template for product and marketing websites.",
    pricingDescription:
      "Compare Free, Pro, and Business plans. Transparent template limits.",
    blogDescription:
      "Product updates, changelog releases, and template articles from the marketing site.",
    docsDescription:
      "Documentation for installing, configuring, and deploying the template.",
    featuresDescription:
      "Template feature overview and example deep-dive routes — replace with your product areas in v1.",
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
    faq: "FAQ",
    docs: "Docs",
    dashboard: "Dashboard",
    github: "View on GitHub",
  },
  home: {
    heroTitle: "Build faster with {{name}}",
    heroMicrocopy: "Try it for free, no account or credit card required",
    howItWorksTitle: "How it works",
    metricsTitle: "Built for speed",
    testimonialTitle: "What teams are saying",
    testimonialPrev: "Previous testimonial",
    testimonialNext: "Next testimonial",
    freeTierBadge: "Free forever",
    popularTierBadge: "Most popular",
    faqTitle: "Frequently Asked Questions",
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
    faqTitle: "Pricing FAQ",
  },
  blog: {
    title: "Blog",
    back: "← Back to blog",
    changelogVersion: "v{{version}}",
    changelogLabel: "Changelog",
  },
  docs: {
    title: "Documentation",
    intro:
      "Guides for local setup, configuration, and deployment. Content is English-only in the template — translate in v1 if needed.",
    back: "← All docs",
    sidebar: "Documentation navigation",
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
    about: "About",
    customers: "Customers",
    blog: "Blog",
    security: "Security",
    docs: "Docs",
    faq: "FAQ",
    github: "GitHub",
    privacy: "Privacy",
    terms: "Terms",
  },
  pages: {
    features: { title: "Features" },
    pricing: { title: "Pricing" },
    customers: { title: "Customers" },
    security: { title: "Security" },
    about: { title: "About" },
    docs: { title: "Documentation" },
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
