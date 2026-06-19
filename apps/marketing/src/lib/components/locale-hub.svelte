<script lang="ts">
  import { cn } from "@repo/utils";
  import { navLinkClass } from "@repo/utils/chrome";
  import {
    MARKETING_LOCALES,
    mt,
    SUPPORTED_LOCALES,
    type Locale,
  } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";

  interface Props {
    /** Optional path segment after the locale (e.g. `blog`). */
    path?: string;
    class?: string;
  }

  let { path = "", class: className }: Props = $props();

  const hubTitle = mt("language.hubTitle", "en");
</script>

<nav class={cn("marketing-container py-16", className)} aria-label={hubTitle}>
  <h1 class="text-foreground mb-6 text-2xl font-semibold">{hubTitle}</h1>
  <ul class="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
    {#each MARKETING_LOCALES as locale (locale)}
      <li>
        <a
          href={localizedPath(locale as Locale, path)}
          class={navLinkClass}
          hreflang={locale}
          lang={locale}
          data-locale-link
        >
          {SUPPORTED_LOCALES[locale as Locale]}
        </a>
      </li>
    {/each}
  </ul>
</nav>
