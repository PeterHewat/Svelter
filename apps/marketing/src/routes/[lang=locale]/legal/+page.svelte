<script lang="ts">
  import { cn } from "@repo/utils";
  import type { MarketingTranslationKey } from "$lib/i18n";
  import { useMarketingT } from "$lib/marketing-context";
  import {
    marketingContent,
    type LegalPageContent,
    type LegalSecurityContent,
  } from "$lib/marketing-content";
  import { SITE_NAME } from "$lib/site";

  const t = useMarketingT();
  const { security, privacy, terms } = marketingContent.legal;

  type LegalSection =
    | {
        id: "security";
        titleKey: MarketingTranslationKey;
        content: LegalSecurityContent;
      }
    | {
        id: "privacy" | "terms";
        titleKey: MarketingTranslationKey;
        content: LegalPageContent;
      };

  const sections: LegalSection[] = [
    { id: "security", titleKey: "pages.security.title", content: security },
    { id: "privacy", titleKey: "pages.privacy.title", content: privacy },
    { id: "terms", titleKey: "pages.terms.title", content: terms },
  ];

  const sectionClass =
    "scroll-mt-24 border-border mt-20 border-t pt-16 first:mt-12 first:border-t-0 first:pt-0";
</script>

<svelte:head>
  <title>{t("pages.legal.title")} — {SITE_NAME}</title>
  <meta name="description" content={t("meta.legalDescription")} />
</svelte:head>

<div class="marketing-container py-16">
  <h1 class="text-4xl font-bold">{t("pages.legal.title")}</h1>

  {#each sections as section (section.id)}
    <section id={section.id} class={cn(sectionClass)}>
      <h2 class="text-2xl font-semibold">{t(section.titleKey)}</h2>
      <p class="text-muted-foreground mt-4 max-w-2xl text-lg">
        {section.content.intro}
      </p>
      {#if section.id === "security"}
        {@const subprocessors = section.content.subprocessors}
        <div class="mt-8 max-w-3xl overflow-x-auto">
          <h3 class="text-lg font-semibold">
            {t("security.subprocessorsTitle")}
          </h3>
          <table class="mt-4 w-full border-collapse text-left text-sm">
            <thead>
              <tr class="border-b">
                <th class="py-3 pr-4 font-medium"
                  >{t("security.subprocessorName")}</th
                >
                <th class="py-3 pr-4 font-medium">
                  {t("security.subprocessorPurpose")}
                </th>
                <th class="py-3 font-medium">
                  {t("security.subprocessorLocation")}
                </th>
              </tr>
            </thead>
            <tbody>
              {#each subprocessors as row (row.name)}
                <tr class="border-b">
                  <td class="py-3 pr-4">{row.name}</td>
                  <td class="text-muted-foreground py-3 pr-4">{row.purpose}</td>
                  <td class="text-muted-foreground py-3">{row.location}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>
  {/each}
</div>
