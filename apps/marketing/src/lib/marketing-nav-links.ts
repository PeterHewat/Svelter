import type { Locale, MarketingTranslationKey } from "$lib/i18n";
import {
  localizedAnchor,
  localizedLegalAnchor,
  localizedPath,
} from "$lib/locale-path";

export type MarketingLinkDef = {
  href: (lang: Locale) => string;
  labelKey: MarketingTranslationKey;
  external?: boolean;
};

const anchor = (
  fragment: string,
  labelKey: MarketingTranslationKey,
): MarketingLinkDef =>
  ({
    href: (lang: Locale) => localizedAnchor(lang, fragment),
    labelKey,
  }) as const;

const path = (
  segment: string,
  labelKey: MarketingTranslationKey,
): MarketingLinkDef =>
  ({
    href: (lang: Locale) => localizedPath(lang, segment),
    labelKey,
  }) as const;

const legalAnchor = (
  fragment: string,
  labelKey: MarketingTranslationKey,
): MarketingLinkDef =>
  ({
    href: (lang: Locale) => localizedLegalAnchor(lang, fragment),
    labelKey,
  }) as const;

/** Homepage product anchors — footer Product column. */
export const productNavLinks = [
  anchor("features", "nav.features"),
  anchor("pricing", "nav.pricing"),
  anchor("faq", "nav.faq"),
] as const satisfies readonly MarketingLinkDef[];

/** Primary header nav. */
export const headerNavLinks = [
  anchor("features", "nav.features"),
  anchor("pricing", "nav.pricing"),
  anchor("faq", "nav.faq"),
  anchor("about", "nav.about"),
  path("docs", "nav.docs"),
  path("blog", "nav.blog"),
] as const satisfies readonly MarketingLinkDef[];

export const footerCompanyLinks = [
  anchor("about", "footer.about"),
  anchor("testimonials", "footer.testimonials"),
] as const satisfies readonly MarketingLinkDef[];

export const footerResourceLinks = [
  path("docs", "nav.docs"),
  path("blog", "nav.blog"),
] as const satisfies readonly MarketingLinkDef[];

export const footerLegalLinks = [
  legalAnchor("security", "footer.security"),
  legalAnchor("privacy", "footer.privacy"),
  legalAnchor("terms", "footer.terms"),
] as const satisfies readonly MarketingLinkDef[];
