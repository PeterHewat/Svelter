<script lang="ts">
  import { cn } from "@repo/utils";
  import { siteNavLinkClass } from "@repo/utils/chrome";
  import { useMarketingLang, useMarketingT } from "$lib/marketing-context";
  import {
    footerCompanyLinks,
    footerLegalLinks,
    footerResourceLinks,
    productNavLinks,
  } from "$lib/marketing-nav-links";
  import { localizedPath } from "$lib/locale-path";
  import { SITE_NAME } from "$lib/site";

  const t = useMarketingT();
  const lang = useMarketingLang();
  const year = new Date().getFullYear();
  const copyright = $derived(t("footer.copyright", { year, name: SITE_NAME }));
  const homeHref = $derived(localizedPath(lang));

  const footerLinkClass = cn(
    siteNavLinkClass,
    "hover:text-foreground transition-colors",
  );

  const productLinks = $derived(
    productNavLinks.map((link) => ({
      href: link.href(lang),
      label: t(link.labelKey),
    })),
  );

  const companyLinks = $derived(
    footerCompanyLinks.map((link) => ({
      href: link.href(lang),
      label: t(link.labelKey),
    })),
  );

  const resourceLinks = $derived(
    footerResourceLinks.map((link) => ({
      href: link.href(lang),
      label: t(link.labelKey),
      ...("external" in link ? { external: link.external } : {}),
    })),
  );

  const legalLinks = $derived(
    footerLegalLinks.map((link) => ({
      href: link.href(lang),
      label: t(link.labelKey),
    })),
  );

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
    <p class="mt-12 text-center text-sm">
      <a
        href={homeHref}
        class="text-muted-foreground hover:text-foreground transition-colors"
        data-site-home-link
      >
        {copyright}
      </a>
    </p>
  </div>
</footer>
