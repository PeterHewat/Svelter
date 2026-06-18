<script lang="ts">
  import { cn } from "@repo/utils";
  import ProductAppLink from "$lib/components/product-app-link.svelte";
  import ProductFrame from "$lib/components/product-frame.svelte";
  import { mt, type Locale } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";
  import { marketingContent } from "$lib/marketing-content";
  import { SITE_NAME } from "$lib/site";

  interface Props {
    lang: Locale;
  }

  let { lang }: Props = $props();

  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const blogHref = $derived(localizedPath(lang, "blog"));

  const primaryCtaClass =
    "inline-flex h-11 items-center rounded-md px-6 text-base font-medium";
  const secondaryCtaClass =
    "border-border bg-background text-foreground hover:bg-muted inline-flex h-11 items-center rounded-md border px-6 text-base font-medium";
</script>

<section class="bg-primary text-primary-foreground py-16 md:py-24">
  <div class="container mx-auto grid items-center gap-12 px-4 lg:grid-cols-2">
    <div class="text-center lg:text-left">
      <h1 class="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
        {t("home.heroTitle", { name: SITE_NAME })}
      </h1>
      <p class="mb-8 text-lg opacity-90 md:text-xl">
        {t("home.heroSubtitle")}
      </p>
      <div
        class="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
      >
        <ProductAppLink
          kind="signup"
          utmCampaign="hero"
          class={cn(primaryCtaClass, "text-primary bg-white hover:bg-gray-100")}
        >
          {t("home.heroCta")}
        </ProductAppLink>
        <a href={blogHref} class={secondaryCtaClass}>
          {t("home.heroSecondaryCta")}
        </a>
      </div>
      <p class="mt-4 text-sm opacity-80">{t("home.heroMicrocopy")}</p>
    </div>
    <ProductFrame screenshotAlt={marketingContent.hero.screenshotAlt} />
  </div>
</section>
