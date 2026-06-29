import type { TranslationKey } from "$lib/i18n";

export type AppNavLink = {
  href: string;
  label: string;
  active: boolean;
};

type Translate = (key: TranslationKey) => string;

/**
 * Product app header nav links for the current route.
 *
 * @param pathname - Current URL pathname
 * @param t - i18n translate function
 */
export function getAppNavLinks(pathname: string, t: Translate): AppNavLink[] {
  return [
    {
      href: "/tasks",
      label: t("nav.tasks"),
      active: pathname === "/tasks",
    },
    {
      href: "/user",
      label: t("nav.user"),
      active: pathname === "/user",
    },
  ];
}
