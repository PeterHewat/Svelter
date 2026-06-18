<script lang="ts">
  import { DOCS_URL } from "@repo/config/product";
  import { cn } from "@repo/utils";
  import { navSecondaryLinkClass, siteFooterClass } from "@repo/utils/chrome";
  import { mt, type Locale } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";
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
    "hover:text-foreground block py-1",
  );

  const columns = $derived([
    {
      title: t("footer.product"),
      links: [
        { href: localizedPath(lang, "features"), label: t("footer.features") },
        { href: localizedPath(lang, "pricing"), label: t("footer.pricing") },
        {
          href: localizedPath(lang, "integrations"),
          label: t("footer.integrations"),
        },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: localizedPath(lang, "about"), label: t("footer.about") },
        {
          href: localizedPath(lang, "customers"),
          label: t("footer.customers"),
        },
        { href: localizedPath(lang, "blog"), label: t("footer.blog") },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        {
          href: DOCS_URL,
          label: t("footer.docs"),
          external: true as const,
        },
        {
          href: GITHUB_REPO_URL,
          label: t("footer.github"),
          external: true as const,
        },
        {
          href: localizedPath(lang, "security"),
          label: t("footer.security"),
        },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        {
          href: localizedPath(lang, "legal/privacy"),
          label: t("footer.privacy"),
        },
        {
          href: localizedPath(lang, "legal/terms"),
          label: t("footer.terms"),
        },
      ],
    },
  ]);
</script>

<footer class={cn(siteFooterClass, "py-12 text-left")}>
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
      {#each columns as column (column.title)}
        <div>
          <h2 class="text-foreground mb-3 text-sm font-semibold">
            {column.title}
          </h2>
          <ul class="space-y-1" role="list">
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
    <p class="text-muted-foreground mt-10 text-center text-sm">{copyright}</p>
  </div>
</footer>
