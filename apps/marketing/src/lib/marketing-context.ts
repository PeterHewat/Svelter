import { getContext, setContext } from "svelte";
import { createMarketingT, type Locale, type MarketingT } from "$lib/i18n";

const MARKETING_CONTEXT = Symbol("marketing-context");

type MarketingContext = {
  readonly lang: Locale;
  readonly t: MarketingT;
};

/**
 * Registers locale and translator for descendant marketing components.
 *
 * @param getLang - Resolves the active locale (closure keeps prop reads reactive)
 */
export function setMarketingContext(getLang: () => Locale): MarketingContext {
  const value: MarketingContext = {
    get lang() {
      return getLang();
    },
    get t() {
      return createMarketingT(getLang());
    },
  };
  setContext(MARKETING_CONTEXT, value);
  return value;
}

/** @returns Marketing layout context (lang + `t`). */
export function useMarketingContext(): MarketingContext {
  return getContext(MARKETING_CONTEXT);
}

/** @returns Translator bound to the active marketing locale. */
export function useMarketingT(): MarketingT {
  return useMarketingContext().t;
}

/** @returns Active marketing locale from layout context. */
export function useMarketingLang(): Locale {
  return useMarketingContext().lang;
}
