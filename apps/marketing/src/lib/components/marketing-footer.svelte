<script lang="ts">
  import { cn } from "@repo/utils";
  import { navSecondaryLinkClass } from "@repo/utils/chrome";
  import { mt, type Locale } from "$lib/i18n";
  import { localizedAnchor, localizedPath } from "$lib/locale-path";
  import { GITHUB_REPO_URL } from "$lib/site";

  interface Props {
    lang: Locale;
    copyright: string;
  }

  let { lang, copyright }: Props = $props();

  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );

  const footerLinkClass = cn(
    navSecondaryLinkClass,
    "hover:text-foreground transition-colors",
  );

  const productLinks = $derived([
    { href: localizedAnchor(lang, "features"), label: t("footer.features") },
    { href: localizedPath(lang, "docs"), label: t("footer.docs") },
    { href: localizedPath(lang, "blog"), label: t("footer.blog") },
    { href: localizedAnchor(lang, "faq"), label: t("footer.faq") },
    { href: localizedAnchor(lang, "pricing"), label: t("footer.pricing") },
  ]);

  const companyLinks = $derived([
    { href: localizedPath(lang, "about"), label: t("footer.about") },
    { href: localizedPath(lang, "customers"), label: t("footer.customers") },
  ]);

  const resourceLinks = $derived([
    {
      href: localizedPath(lang, "security"),
      label: t("footer.security"),
    },
    {
      href: GITHUB_REPO_URL,
      label: t("footer.github"),
      external: true as const,
    },
  ]);

  const legalLinks = $derived([
    {
      href: localizedPath(lang, "legal/privacy"),
      label: t("footer.privacy"),
    },
    {
      href: localizedPath(lang, "legal/terms"),
      label: t("footer.terms"),
    },
  ]);

  const footerColumns = $derived([
    { title: t("footer.product"), links: productLinks },
    { title: t("footer.company"), links: companyLinks },
    { title: t("footer.resources"), links: resourceLinks },
    { title: t("footer.legal"), links: legalLinks },
  ]);
</script>

<footer class="bg-muted text-muted-foreground py-16 text-sm">
  <div class="marketing-container">
    <div
      class="grid grid-cols-2 gap-x-12 gap-y-12 lg:flex lg:flex-wrap lg:justify-between lg:gap-y-12"
    >
      {#each footerColumns as column (column.title)}
        <div class="min-w-[9rem] lg:shrink-0">
          <h2 class="text-foreground mb-4 text-sm font-semibold tracking-wide">
            {column.title}
          </h2>
          <ul class="space-y-3" role="list">
            {#each column.links as link (link.href)}
              <li>
                <a
                  href={link.href}
                  class={footerLinkClass}
                  target={"external" in link && link.external
                    ? "_blank"
                    : undefined}
                  rel={"external" in link && link.external
                    ? "noopener noreferrer"
                    : undefined}
                >
                  {link.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
    <p class="text-muted-foreground mt-12 text-center text-sm">{copyright}</p>
  </div>
</footer>
