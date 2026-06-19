import type { Component } from "svelte";
import CtaBand from "$lib/components/cta-band.svelte";
import Faq from "$lib/components/faq.svelte";
import FeatureRows from "$lib/components/feature-rows.svelte";
import HowItWorks from "$lib/components/how-it-works.svelte";
import LogoBar from "$lib/components/logo-bar.svelte";
import MetricsStrip from "$lib/components/metrics-strip.svelte";
import PricingTable from "$lib/components/pricing-table.svelte";
import Testimonial from "$lib/components/testimonial.svelte";
import type { MarketingSectionKey } from "$lib/marketing-content";

type HomepageSection = {
  key: MarketingSectionKey;
  component: Component<Record<string, unknown>>;
  props?: Record<string, unknown>;
};

export const homepageSections: readonly HomepageSection[] = [
  { key: "featureRows", component: FeatureRows },
  { key: "logoBar", component: LogoBar },
  { key: "howItWorks", component: HowItWorks },
  { key: "metrics", component: MetricsStrip },
  { key: "pricing", component: PricingTable },
  { key: "faq", component: Faq, props: { jsonLd: true } },
  { key: "testimonial", component: Testimonial },
  { key: "ctaBand", component: CtaBand },
];
