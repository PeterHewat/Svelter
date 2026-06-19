import type { MarketingTranslationKey } from "$lib/i18n";
import type { marketingContent } from "$lib/marketing-content";

export type MarketingStubId = "about" | "customers" | "privacy" | "terms";

type StubContentKey = keyof typeof marketingContent.stubs;

export type MarketingStubPageConfig = {
  titleKey: MarketingTranslationKey;
  descriptionKey: MarketingTranslationKey;
  contentKey: StubContentKey;
};

export const marketingStubPages = {
  about: {
    titleKey: "pages.about.title",
    descriptionKey: "meta.aboutDescription",
    contentKey: "about",
  },
  customers: {
    titleKey: "pages.customers.title",
    descriptionKey: "meta.customersDescription",
    contentKey: "customers",
  },
  privacy: {
    titleKey: "pages.privacy.title",
    descriptionKey: "meta.privacyDescription",
    contentKey: "privacy",
  },
  terms: {
    titleKey: "pages.terms.title",
    descriptionKey: "meta.termsDescription",
    contentKey: "terms",
  },
} as const satisfies Record<MarketingStubId, MarketingStubPageConfig>;
