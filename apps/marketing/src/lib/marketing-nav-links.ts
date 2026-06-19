import type { Locale, MarketingTranslationKey } from "$lib/i18n";
import { localizedAnchor, localizedPath } from "$lib/locale-path";
import { GITHUB_REPO_URL } from "$lib/site";

export type MarketingLinkDef = {
  href: (lang: Locale) => string;
  labelKey: MarketingTranslationKey;
  external?: boolean;
};

/** Primary product links shared by header nav and footer product column. */
export const productNavLinks = [
  {
    href: (lang: Locale) => localizedAnchor(lang, "features"),
    labelKey: "nav.features",
  },
  {
    href: (lang: Locale) => localizedPath(lang, "docs"),
    labelKey: "nav.docs",
  },
  {
    href: (lang: Locale) => localizedPath(lang, "blog"),
    labelKey: "nav.blog",
  },
  {
    href: (lang: Locale) => localizedAnchor(lang, "pricing"),
    labelKey: "nav.pricing",
  },
  {
    href: (lang: Locale) => localizedAnchor(lang, "faq"),
    labelKey: "nav.faq",
  },
] as const satisfies readonly MarketingLinkDef[];

export const footerCompanyLinks = [
  {
    href: (lang: Locale) => localizedPath(lang, "about"),
    labelKey: "footer.about",
  },
  {
    href: (lang: Locale) => localizedPath(lang, "customers"),
    labelKey: "footer.customers",
  },
] as const satisfies readonly MarketingLinkDef[];

export const footerResourceLinks = [
  {
    href: (lang: Locale) => localizedPath(lang, "security"),
    labelKey: "footer.security",
  },
  {
    href: () => GITHUB_REPO_URL,
    labelKey: "footer.github",
    external: true,
  },
] as const satisfies readonly MarketingLinkDef[];

export const footerLegalLinks = [
  {
    href: (lang: Locale) => localizedPath(lang, "legal/privacy"),
    labelKey: "footer.privacy",
  },
  {
    href: (lang: Locale) => localizedPath(lang, "legal/terms"),
    labelKey: "footer.terms",
  },
] as const satisfies readonly MarketingLinkDef[];
