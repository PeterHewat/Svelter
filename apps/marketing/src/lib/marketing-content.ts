/** Section toggles — disable blocks in v1 without deleting components. */
export type MarketingSectionKey =
  | "logoBar"
  | "howItWorks"
  | "featureRows"
  | "metrics"
  | "pricing"
  | "testimonial"
  | "faq"
  | "ctaBand";

export type MarketingSections = Record<
  MarketingSectionKey,
  { enabled: boolean }
>;

export const marketingSections: MarketingSections = {
  logoBar: { enabled: true },
  howItWorks: { enabled: true },
  featureRows: { enabled: true },
  metrics: { enabled: true },
  pricing: { enabled: true },
  testimonial: { enabled: true },
  faq: { enabled: true },
  ctaBand: { enabled: true },
};

export type HowItWorksStep = {
  title: string;
  body: string;
};

export type FeatureRowContent = {
  slug: string;
  title: string;
  body: string;
  /** Placeholder screenshot label — replace image in v1. */
  imageLabel: string;
  bullets?: string[];
};

export type MetricItem = {
  value: string;
  label: string;
};

export type PricingTier = {
  id: "free" | "pro" | "business";
  name: string;
  description: string;
  /** Example limits — replace in v1. */
  limits: string[];
  /** Free tier — visually dominant on cards. */
  highlighted?: boolean;
  /** Pro tier — “Most popular” badge. */
  popular?: boolean;
  monthlyPrice: string;
  monthlyPeriod: string;
  /** Shown when annual billing is selected — replace in v1. */
  annualPrice: string;
  annualPeriod: string;
  annualNote: string;
};

/** @deprecated Alias for {@link PricingTier}. */
export type PricingTierTeaser = PricingTier;

export type ComparisonCell = "included" | "excluded" | string;

export type ComparisonRow = {
  feature: string;
  free: ComparisonCell;
  pro: ComparisonCell;
  business: ComparisonCell;
};

export type EnterprisePlan = {
  name: string;
  description: string;
};

export type TestimonialItem = {
  /** Placeholder quote — replace in v1. */
  quote: string;
  name: string;
  role: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type SubprocessorRow = {
  name: string;
  purpose: string;
  location: string;
};

export type FeatureDeepDive = FeatureRowContent;

export type StubPageContent = {
  /** Intro paragraph — replace in v1. */
  intro: string;
};

/** Template marketing body copy — replace in v1. Labels live in i18n (`mt()`). */
export const marketingContent = {
  hero: {
    /** Alt text for the hero screenshot placeholder — replace in v1. */
    screenshotAlt: "Product app screenshot placeholder",
  },
  logoBar: {
    /** Replace in v1 — or disable `logoBar` section. */
    tagline: "Trusted by teams building with the template",
    /** Placeholder logos — replace in v1 with real assets or disable `logoBar`. */
    logos: [
      { name: "Acme Corp" },
      { name: "Northwind" },
      { name: "Globex" },
      { name: "Initech" },
      { name: "Umbrella Co" },
    ],
  },
  howItWorks: {
    steps: [
      {
        title: "Create your free account",
        body: "Sign up in seconds — no credit card, no sales call. Start building immediately.",
      },
      {
        title: "Connect your stack",
        body: "Wire Clerk auth, Convex backend, and your product routes using the included template.",
      },
      {
        title: "Ship to production",
        body: "Deploy the product SPA and static marketing site to any CDN with the included CI pipeline.",
      },
    ] satisfies HowItWorksStep[],
  },
  featureRows: [
    {
      slug: "one-framework-two-surfaces",
      title: "One framework, two surfaces",
      body: "SvelteKit powers your product SPA and prerendered marketing site from a shared monorepo — one design system, one deploy story.",
      imageLabel: "Product and marketing apps",
    },
    {
      slug: "auth-and-data",
      title: "Auth and realtime data",
      body: "The template wires Clerk and Convex so your product app gets authentication, org switching, and realtime data without a custom API layer. Marketing pages stay static — only the product SPA talks to Convex.",
      imageLabel: "Auth and tasks demo",
      bullets: [
        "Clerk sign-up, sign-in, and organization switcher",
        "Convex queries and mutations with end-to-end types",
        "Marketing site remains prerendered with no backend runtime",
      ],
    },
  ] satisfies FeatureRowContent[],
  metrics: [
    { value: "10 min", label: "to first deploy" },
    { value: "2 apps", label: "product + marketing" },
    { value: "$0", label: "to start building" },
  ] satisfies MetricItem[],
  pricingTiers: [
    {
      id: "free",
      name: "Free",
      description: "For side projects and evaluation.",
      limits: ["Up to 3 team members", "1,000 records", "Community support"],
      monthlyPrice: "$0",
      monthlyPeriod: "forever",
      annualPrice: "$0",
      annualPeriod: "forever",
      annualNote: "",
    },
    {
      id: "pro",
      name: "Pro",
      description: "For growing teams shipping weekly.",
      limits: ["Unlimited members", "50,000 records", "Email support"],
      popular: true,
      monthlyPrice: "$29",
      monthlyPeriod: "per seat / month",
      annualPrice: "$24",
      annualPeriod: "per seat / month",
      annualNote: "$288 billed annually per seat",
    },
    {
      id: "business",
      name: "Business",
      description: "For teams that need controls and SLAs.",
      limits: ["SSO + audit logs", "Unlimited records", "Priority support"],
      monthlyPrice: "$79",
      monthlyPeriod: "per seat / month",
      annualPrice: "$66",
      annualPeriod: "per seat / month",
      annualNote: "$792 billed annually per seat",
    },
  ] satisfies PricingTier[],
  pricingPage: {
    /** Section intro — replace in v1. */
    intro:
      "Open the app to try the product. Upgrade or sign up in-app when you're ready. Example limits below — replace with your real plans in v1.",
    comparisonRows: [
      {
        feature: "Team members",
        free: "3",
        pro: "Unlimited",
        business: "Unlimited",
      },
      {
        feature: "Records",
        free: "1,000",
        pro: "50,000",
        business: "Unlimited",
      },
      {
        feature: "Email support",
        free: "excluded",
        pro: "included",
        business: "included",
      },
      {
        feature: "SSO",
        free: "excluded",
        pro: "excluded",
        business: "included",
      },
      {
        feature: "Audit logs",
        free: "excluded",
        pro: "excluded",
        business: "included",
      },
      {
        feature: "Priority support",
        free: "excluded",
        pro: "excluded",
        business: "included",
      },
    ] satisfies ComparisonRow[],
    enterprise: {
      name: "Enterprise",
      description:
        "Custom limits, dedicated support, and security reviews for larger organizations.",
    } satisfies EnterprisePlan,
  },
  testimonials: [
    {
      quote:
        "We cloned the template on Monday and had auth, tasks, and a marketing site live by Wednesday. The self-serve defaults saved us weeks.",
      name: "Alex Chen",
      role: "Founder, Example Startup",
    },
    {
      quote:
        "The split between marketing and product apps just clicked. Our landing pages ship as static HTML while the dashboard stays a fast SPA.",
      name: "Jordan Lee",
      role: "CTO, Northwind Labs",
    },
    {
      quote:
        "Pricing, docs, and i18n were already wired. We spent our first sprint on the actual product instead of boilerplate.",
      name: "Samira Okonkwo",
      role: "Head of Product, Brightline",
    },
  ] satisfies TestimonialItem[],
  faq: [
    {
      question: "Is the free plan really free?",
      answer:
        "Yes. The template ships with a prominent free tier and example limits. Replace the placeholder numbers with your real plan limits in v1.",
    },
    {
      question: "Do I need a credit card to start?",
      answer:
        "No. Marketing links open the product app. Sign-up, billing, and upgrades happen in-app via Clerk when users choose.",
    },
    {
      question: "Can I use my own domain?",
      answer:
        "Yes. The monorepo includes Cloudflare Pages configuration for separate product and marketing hostnames.",
    },
    {
      question: "What happens when I outgrow the free tier?",
      answer:
        "Upgrade paths are built into the homepage pricing section. Wire your billing provider in v1 when you are ready.",
    },
    {
      question: "Can I stay on the free plan?",
      answer:
        "Yes. The free tier is designed to be genuinely usable for evaluation and small projects. Replace example limits with your real entitlements in v1.",
    },
    {
      question: "How does annual billing work?",
      answer:
        "Annual pricing shows the effective monthly rate when billed yearly. Wire your payment provider and actual discounts in v1.",
    },
    {
      question: "What counts toward record limits?",
      answer:
        "Template copy only — define your own metering rules (rows, events, seats, etc.) when you adopt the template.",
    },
    {
      question: "Is there a sales-led Enterprise option?",
      answer:
        "The Enterprise row is a stub for custom contracts. Replace with your sales process in v1.",
    },
  ] satisfies FaqItem[],
  ctaBand: {
    title: "Ready to ship your product?",
    subtitle:
      "Clone the template, customize the placeholder content, and deploy today.",
  },
  stubs: {
    features: {
      intro:
        "Explore the template’s marketing routes and one example feature deep-dive. Replace with your real product areas in v1.",
    },
    customers: {
      intro:
        "Customer stories and logos belong here. The template uses labeled placeholders on the homepage — add real quotes and case studies in v1.",
    },
    security: {
      intro:
        "Security and compliance copy for your buyers. Replace the subprocessors table and policies before launch.",
      subprocessors: [
        {
          name: "Clerk",
          purpose: "Authentication",
          location: "United States",
        },
        {
          name: "Convex",
          purpose: "Database and backend",
          location: "United States",
        },
        {
          name: "Cloudflare",
          purpose: "CDN and hosting",
          location: "Global",
        },
      ] satisfies SubprocessorRow[],
    },
    about: {
      intro:
        "Tell your company story, team, and mission here. This stub keeps the footer sitemap complete for the template.",
    },
    privacy: {
      intro:
        "Placeholder privacy policy. Engage counsel and replace this entire page before collecting user data in production.",
    },
    terms: {
      intro:
        "Placeholder terms of service. Replace with counsel-reviewed terms before launch.",
    },
  } satisfies Record<
    "features" | "customers" | "security" | "about" | "privacy" | "terms",
    StubPageContent | (StubPageContent & { subprocessors?: SubprocessorRow[] })
  >,
};

/**
 * Returns all feature slugs for prerender entries and deep links.
 */
export function getFeatureDeepDiveSlugs(): string[] {
  return marketingContent.featureRows.map((feature) => feature.slug);
}

/**
 * Loads a feature by slug.
 *
 * @param slug - URL segment under `/features/[slug]` or homepage `#` anchor
 */
export function getFeatureDeepDive(
  slug: string,
): FeatureRowContent | undefined {
  return marketingContent.featureRows.find((feature) => feature.slug === slug);
}
